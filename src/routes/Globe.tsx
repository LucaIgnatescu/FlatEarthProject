import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, Mesh, Points, Sprite, TextureLoader, TubeGeometry, Vector3 } from "three";
import { CityName, truePositions } from "../coordinates";
import { polarToCartesian, slerp, sca, SphericalPolarDistance, TextSprite, cartesianToPolar, useDistanceInfo } from "../utils";
import { AnimationStatus, CityTable, ContextProvider, Distances, useAnimationContext, useRenderContext, useUIContext, useUpdateContext } from "../state";
import { UIWrapper } from "../ui";
import { EARTH_RADIUS } from "../utils";
const SPHERE_RADIUS = 30;

export default function Globe() {
  const calculateDistances = (cities: CityTable) => { // FIX:
    const currDistaces: Distances = {};
    for (const [cityName1, cityMesh1] of Object.entries(cities) as [CityName, Mesh][]) {
      for (const [cityName2, cityMesh2] of Object.entries(cities) as [CityName, Mesh][]) {
        const p1 = cartesianToPolar(cityMesh1.position, SPHERE_RADIUS);
        const p2 = cartesianToPolar(cityMesh2.position, SPHERE_RADIUS);
        const distance = SphericalPolarDistance(p1, p2, EARTH_RADIUS); //compute distances as if on the earth
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
      <UIWrapper>
      </UIWrapper>
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
  const ref = useRef<Mesh>(null!);

  const dragCity = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !hoveredCityRef.current) return;
    const meshes = event.intersections.filter((intersection) => intersection.object instanceof Mesh);
    if (meshes.length === 0) return;
    const earthIntersection = meshes[meshes.length - 1];
    if (earthIntersection === undefined) throw new Error("Didn't intersect earth");
    const { x, y, z } = earthIntersection.point;
    moveHoveredCity(x, y, z);
    event.stopPropagation();
  }
  return (
    <>
      <mesh onPointerUp={() => setIsDragging(false)} onPointerMove={dragCity} ref={ref}>
        <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
        <meshBasicMaterial map={texture} />
      </mesh >
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

type AnimationData = {
  source: Vector3,
  dest: Vector3,
  elapsed: number
}

function City({ cityName, animation }: { cityName: CityName, animation: AnimationStatus }) {
  const radius = 0.2;
  const animationTime = 2;
  const meshRef = useRef<Mesh>(null!);
  const { hoveredCityRef, isDragging, citiesRef } = useRenderContext();
  const { updateCurrDistances, updateAnimationState, updateHoveredCity, updateCities, setIsDragging } = useUpdateContext();


  useEffect(() => {
    if (citiesRef.current[cityName] !== undefined) {
      meshRef.current.position.copy(citiesRef.current[cityName].position);
    }
    updateCities(cityName, meshRef.current);
  });

  useEffect(() => {
    const { lat, lon } = truePositions[cityName];
    const { x, y, z } = polarToCartesian(lat + sca(), lon + sca(), SPHERE_RADIUS); // TODO: scatter
    meshRef.current.position.set(x, y, z);
  }, [cityName]);

  const onHover = (event: ThreeEvent<PointerEvent>) => {
    if (
      event.intersections.find(intersection => intersection.object.uuid === meshRef.current.uuid) &&
      cityName !== hoveredCityRef.current?.name &&
      isDragging === false
    ) {
      updateHoveredCity(cityName);
    }
  };

  const animationData = useRef<AnimationData | null>(null); // NOTE: Null means we should not be animating

  useEffect(() => {
    if (animation === 'global') {
      const pos = polarToCartesian(truePositions[cityName].lat, truePositions[cityName].lon, SPHERE_RADIUS);
      const source = new Vector3().copy(meshRef.current.position).normalize();
      const dest = new Vector3(pos.x, pos.y, pos.z).normalize();
      if (source.distanceTo(dest) > 0.01) {
        animationData.current = {
          source,
          dest,
          elapsed: 0
        };
      }
    } else if (animation === null) {
      animationData.current = null
    }
  }, [animation, cityName])

  useFrame((_, delta) => {
    if (animation !== 'global' || animationData.current === null) return;
    if (animationData.current.elapsed > animationTime) {
      meshRef.current.position.copy(animationData.current.dest.multiplyScalar(SPHERE_RADIUS));
      animationData.current = null;
      updateAnimationState(null);
      updateCurrDistances();
      return
    }

    const pos = slerp(animationData.current.source, animationData.current.dest, animationData.current.elapsed / animationTime);
    meshRef.current.position.copy(pos.multiplyScalar(SPHERE_RADIUS));
    animationData.current.elapsed += delta;
    updateCurrDistances();
  })

  const spriteArguments = {
    fontsize: 30,
    borderColor: { r: 225, g: 0, b: 0, a: 1.0 },
    backgroundColor: { r: 225, g: 140, b: 0, a: 0.9 }
  };

  const capitalized = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return (
    <mesh ref={meshRef}
      onPointerMove={onHover}
      onPointerDown={() => setIsDragging(true)}
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
  const { animations } = useAnimationContext();
  return (
    Object.entries(Object.keys(truePositions))
      .map(([, cityName]) =>
        <City cityName={cityName as CityName} key={cityName} animation={animations[cityName as CityName] ?? null} />)
  );
}



function Curve({ dest: destName, isCorrect }: { dest: CityName, isCorrect: boolean }) {
  const ref = useRef<Mesh>(null!);
  const { hoveredCityRef, citiesRef } = useRenderContext();
  const { currDistances, realDistances } = useDistanceInfo();


  useFrame(() => {
    if (hoveredCityRef.current === null) {
      ref.current.visible = false;
      return;
    }
    const base = hoveredCityRef.current.mesh.position;
    ref.current.visible = true;

    const destPos = citiesRef.current[destName]?.position;
    if (destPos === undefined) throw new Error(`City ${destName} does not exist`);

    const pts = [];
    const nSegments = 25;

    const destN = new Vector3().copy(destPos).normalize();
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
    <>
      <mesh ref={ref}>
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}

function Curves() {
  const { citiesRef, hoveredCityRef } = useRenderContext();
  // const { currDistances } = useUIContext();
  //
  // const THRESH = 1;
  //
  // if (hoveredCityRef.current === null) return null;

  const cities = citiesRef.current;
  // const hoveredCity = hoveredCityRef.current.name;
  // const realDistances = getRealDistances();
  // const totalCurrent = totalDistance(currDistances);
  // const totalReal = totalDistance(realDistances);

  const curves = [];
  for (const cityName of Object.keys(cities) as CityName[]) {
    if (cities[cityName]?.position === undefined || cityName === hoveredCityRef.current?.name) continue;
    // const d = Math.abs(currDistances[hoveredCity][cityName] / totalCurrent - realDistances[hoveredCity][cityName] / totalReal);
    curves.push(<Curve dest={cityName} key={cityName} isCorrect={false} />)
  }
  return curves;
}

