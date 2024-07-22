import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, Mesh, MeshBasicMaterial, Points, Quaternion, Sphere, SphereGeometry, TextureLoader, TubeGeometry, Vector3 } from "three";
import { CityName, truePositions } from "../coordinates";
import { convertAngToPolar, slerp, sca, SphericalDistance, TextSprite } from "../utils";
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
        <Curves />
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
  const posRef = useRef<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    updateCities(cityName, meshRef.current);
  });

  useEffect(() => {
    const { lat, lon } = truePositions[cityName];
    const { x, y, z } = convertAngToPolar(lat + sca(), lon + sca(), SPHERE_RADIUS); // TODO: scatter
    posRef.current = [x, y, z];
    meshRef.current.position.set(x, y, z);
  }, [cityName]);

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

  const capitalized = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return (
    <mesh ref={meshRef} position={posRef.current}
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



function Curve({ dest, isCorrect }: { dest: Vector3, isCorrect: boolean }) {
  const ref = useRef<Mesh>(null!);
  const { hoveredCityRef } = useRenderContext();
  useFrame(() => {
    const base = hoveredCityRef.current?.mesh.position;
    if (base === undefined) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    const pts = [];
    const nSegments = 25;
    const destN = new Vector3().copy(dest).normalize();
    const baseN = new Vector3().copy(base).normalize();
    for (let i = 0; i <= nSegments; i++) {
      pts.push(slerp(baseN, destN, i / nSegments));
    }
    if (pts.length < 2 || isNaN(pts[0].x)) return; // TODO: FInd out why this happens
    const pts3D = pts.map(q => q.multiplyScalar(SPHERE_RADIUS));
    const curve = new CatmullRomCurve3(pts3D);
    ref.current.geometry.dispose();
    ref.current.geometry = new TubeGeometry(curve, 64, 0.05, 50, false);
  });

  const color = isCorrect ? 0x3acabb : 0xff8400;
  return (
    <mesh ref={ref}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
}


/* function Curve({ dest, isCorrect }: { dest: Vector3, isCorrect: boolean }) {
  const ref = useRef<Mesh>(null!);
  const { hoveredCityRef } = useRenderContext();
  useFrame((state, delta) => {
    const base = hoveredCityRef.current?.mesh.position;
    if (base === undefined) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    const pts = [];
    const nSegments = 10;
    const theta = Math.acos(new Vector3().copy(base).normalize().dot(new Vector3().copy(dest).normalize()));
    for (let i = 0; i <= nSegments; i++) {
      const u = i / nSegments;
      const pt = new Vector3().copy(base).normalize().multiplyScalar(Math.sin((1 - u) * theta) / Math.sin(theta)).add(
        new Vector3().copy(dest).normalize().multiplyScalar(Math.sin(u * theta) / Math.sin(theta))
      );
      console.log(pt);

      pts.push(pt);
    }

    const pts3D = pts.map(q => new Vector3(q.x * SPHERE_RADIUS, q.y * SPHERE_RADIUS, q.z * SPHERE_RADIUS));
    for (const pos of pts3D) {
      const sphere = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({ color: "green" }));
      sphere.position.set(pos.x, pos.y, pos.z);
      state.scene.add(sphere);
    }
  });

  const color = isCorrect ? 0x3acabb : 0xff8400;
  return (
    <mesh ref={ref}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
} */


function Curves() {
  const { citiesRef, hoveredCityRef } = useRenderContext();
  // const { currDistances } = useUIContext();
  //
  // const THRESH = 1;
  //
  if (hoveredCityRef.current === null) return null;

  const cities = citiesRef.current;
  // const hoveredCity = hoveredCityRef.current.name;
  // const realDistances = getRealDistances();
  // const totalCurrent = totalDistance(currDistances);
  // const totalReal = totalDistance(realDistances);

  const curves = [];
  for (const cityName of Object.keys(cities) as CityName[]) {
    if (cities[cityName]?.position === undefined) continue;
    // const d = Math.abs(currDistances[hoveredCity][cityName] / totalCurrent - realDistances[hoveredCity][cityName] / totalReal);
    curves.push(<Curve dest={cities[cityName].position} key={cityName} isCorrect={false} />)
  }
  return curves;
}

