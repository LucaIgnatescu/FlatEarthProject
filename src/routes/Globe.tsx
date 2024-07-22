import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mesh, Points, Quaternion, SphereGeometry, TextureLoader } from "three";
import { CityName, truePositions } from "../coordinates";
import { convertAngToPolar, sca, SphericalDistance, TextSprite } from "../utils";
import { ContextProvider, Distances, useRenderContext, useUpdateContext } from "../state";

const SPHERE_RADIUS = 30;
const EARTH_RADIUS = 6371e3;

export default function Globe() {
  const calculateDistances = (cities: CityTable) => { // FIX:
    const currDistaces: Distances = {};
    for (const [cityName1, cityMesh1] of Object.entries(cities) as [CityName, Mesh][]) {
      for (const [cityName2, cityMesh2] of Object.entries(cities) as [CityName, Mesh][]) {
        const distance = SphericalDistance(truePositions[cityName1], truePositions[cityName2], EARTH_RADIUS);
        if (currDistaces[cityName1] === undefined) currDistaces[cityName1] = {};
        if (currDistaces[cityName2] === undefined) currDistaces[cityName2] = {};
        currDistaces[cityName1][cityName2] = distance;
        currDistaces[cityName2][cityName1] = distance;
      }
    }
    return currDistaces;
  }
  return (
    <ContextProvider calculateDistances={calculateDistances}>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <Controls />
        <Earth />
        <Stars />
        <Cities />
      </Canvas>
    </ContextProvider>
  );
}


function Controls() {
  const { isDragging } = useRenderContext();
  // return <OrbitControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} />
  return <OrbitControls enabled={!isDragging} enablePan={false} enableDamping dampingFactor={0.075} minDistance={50} maxDistance={200} rotateSpeed={0.5} />
}

function Earth() { // TODO: Better wireframe
  const texture = useLoader(TextureLoader, '../../static/img/globe1.jpg');
  const { isDragging, hoveredCityRef } = useRenderContext();
  const { moveHoveredCity, setIsDragging, } = useUpdateContext();
  const { updateCurrDistances } = useUpdateContext();

  const dragCity = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !hoveredCityRef.current) return;
    const meshes = event.intersections.filter((intersection) => intersection.object instanceof Mesh);
    if (meshes.length === 0) return;
    const earthIntersection = meshes[meshes.length - 1];
    if (earthIntersection === undefined) throw new Error("Didn't intersect earth");
    const { x, y, z } = earthIntersection.point;
    moveHoveredCity(x, y, z);
    updateCurrDistances();
  }
  return (
    <>
      <mesh onPointerUp={() => setIsDragging(false)} onPointerMove={dragCity}>
        <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh>
        <sphereGeometry args={[SPHERE_RADIUS, 50, 30]} />
        <meshBasicMaterial color={"grey"} wireframe transparent opacity={0.25} />
      </mesh>
    </>
  );
}

function Stars() {
  const ref = useRef<Points>(null!);
  const starVerticies = useMemo(() => {
    const vertices = [];
    for (let i = 0; i < 50000; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      if (x * x + y * y + z * z > 120000) vertices.push(x, y, z);
    }
    return vertices;
  }, [])

  useFrame((_, delta) => {
    const speed = 0.01;
    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed;
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <float32BufferAttribute args={[starVerticies, 3]} attach={"attributes-position"} />
      </bufferGeometry>
    </points>
  );
}


const City = function({ cityName }: { cityName: CityName }) {
  const radius = 0.2;
  const meshRef = useRef<Mesh>(null!);
  const { hoveredCityRef, isDragging } = useRenderContext();
  const { updateHoveredCity, updateCities, setIsDragging } = useUpdateContext();

  useEffect(() => {
    updateCities(cityName, meshRef.current);
  });

  const onHover = () => {
    if (cityName !== hoveredCityRef.current?.name && isDragging === false) {
      updateHoveredCity(cityName);
    }
  };


  const spriteArguments = {
    fontsize: 30,
    borderColor: { r: 225, g: 0, b: 0, a: 1.0 },
    backgroundColor: { r: 225, g: 140, b: 0, a: 0.9 }
  };

  const { lat, lon } = truePositions[cityName];
  const { x, y, z } = convertAngToPolar(lat, lon, SPHERE_RADIUS); // TODO: scatter
  const capitalized = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return (
    <mesh ref={meshRef} position={[x, y, z]}
      onPointerOver={onHover}
      onPointerDown={
        () => setIsDragging(true)
      } // NOTE: Check sprite effects for bugs
      onPointerLeave={() => {
        if (isDragging) return;
        updateHoveredCity(null);
      }}
    >
      <sphereGeometry args={[radius]} />
      <meshBasicMaterial color={"red"} />
      <TextSprite message={capitalized} parameters={spriteArguments} />
    </mesh >
  )
}

function Cities() {
  return (
    Object.entries(Object.keys(truePositions))
      .map(([, cityName]) => <City cityName={cityName as CityName} key={cityName} />)
  );
}

function Test() {
  const kiev = truePositions['kiev'];
  const p1 = convertAngToPolar(kiev.lat, kiev.lon, SPHERE_RADIUS);
  const q1 = new Quaternion(p1.x, p1.y, p1.z, 0).normalize();
  const q2 = new Quaternion(0, 1, 0, 0).normalize();

  const pts = [];
  for (let i = 0; i <= 5; i += 1) {
    pts.push(new Quaternion().copy(q1).slerp(q2, i / 5));
  }
  console.log(pts);

  return pts.map((point: Quaternion, i) =>
    <mesh position={[point.x * SPHERE_RADIUS, point.y * SPHERE_RADIUS, point.z * SPHERE_RADIUS]} key={i}>

      <sphereGeometry args={[0.5]} />
      <meshBasicMaterial color={"red"} />
    </mesh>)
}

