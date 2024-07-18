import { Line, MapControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, CircleGeometry, ConeGeometry, Mesh, Points, TextureLoader, TubeGeometry, Vector3 } from "three";
import { TextSprite, totalDistance } from "../utils";
import { CityName, cities as truePositions } from "../coordinates"; // NOTE: This used to be an array in the original implementation
import { getRealDistances, RenderContextProvider, UIContextProvider, useRenderContext, useUIContext, useUpdateContext } from "../state";
import { UIWrapper } from "../ui";
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";
import { normalize } from "three/src/math/MathUtils.js";

const EARTH_RADIUS = 80;
const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];

export default function Plane() {
  return (
    <RenderContextProvider>
      <UIContextProvider>
        <Canvas gl={{ antialias: true }} className="bg-black">
          <PerspectiveCamera makeDefault position={[10, 10, 0]} />
          <Controls />
          <ambientLight color={0xffffff} intensity={2} />
          <Cities />
          <Earth />
          <EarthWireframe />
          <Stars />
          <Curves />
        </Canvas>

        <UIWrapper />
      </UIContextProvider>
    </RenderContextProvider>
  ); // TODO: Look into refactoring structure
}

// const MemoizedCanvas = memo(function() {
//   return (
//     <Canvas gl={{ antialias: true }} className="bg-black">
//       <PerspectiveCamera makeDefault position={[10, 10, 0]} />
//       <Controls />
//       <ambientLight color={0xffffff} intensity={2} />
//       <Cities />
//       <Earth />
//       <EarthWireframe />
//       <Stars />
//       <Curves />
//     </Canvas>
//   );
// });

// function CanvasWrapper() {
//   const [currDistances, setCurrDistances] = useState<Distances>({});
//   const { citiesRef } = useRenderContext();
//   const [, startTransition] = useTransition();
//
//   const updateCurrDistances = useCallback(() => {
//     startTransition(() => {
//       const currDistaces: Distances = {};
//       for (const [cityName1, cityMesh1] of Object.entries(citiesRef.current) as [CityName, Mesh][]) {
//         for (const [cityName2, cityMesh2] of Object.entries(citiesRef.current) as [CityName, Mesh][]) {
//           const distance = PlanarDistance(cityMesh1, cityMesh2);
//           if (currDistaces[cityName1] === undefined) currDistaces[cityName1] = {};
//           if (currDistaces[cityName2] === undefined) currDistaces[cityName2] = {};
//           currDistaces[cityName1][cityName2] = distance;
//           currDistaces[cityName2][cityName1] = distance;
//         }
//       }
//       setCurrDistances(currDistaces);
//     })
//   }, [citiesRef]);
//   return (
//     <>
//       <MemoizedCanvas updateCurrDistances={updateCurrDistances} />
//       <UIWrapper currDistances={currDistances} />
//     </>
//   );
// }
//
//
function Controls() {
  const { isDragging } = useRenderContext();
  return <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} />
}

function Earth() {
  const { updateCurrDistances } = useUpdateContext();
  const texture = useLoader(TextureLoader, '../../static/img/disk.png'); // BUG: Earth not receiving intersection without adding onPointerMove
  const { moveHoveredCity, setIsDragging, isDragging, hoveredCityRef } = useRenderContext();

  const dragCity = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !hoveredCityRef.current) return;
    const earthIntersection = event.intersections.find(
      (intersection) => ((intersection.object as Mesh).geometry instanceof CircleGeometry)
    );
    if (earthIntersection === undefined) throw new Error("Didn't intersect earth");
    const { x, z } = earthIntersection.point;
    const { y } = hoveredCityRef.current.mesh.position;
    moveHoveredCity(x, y, z);
    updateCurrDistances();
  }
  useEffect(() => updateCurrDistances(), [updateCurrDistances]);
  return (
    <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}
      onPointerUp={() => setIsDragging(false)}
      onPointerMove={dragCity}>
      <circleGeometry args={[EARTH_RADIUS, 64]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function EarthWireframe() {
  const wireframe = [];
  for (let amplitude = 0; amplitude < EARTH_RADIUS; amplitude += 10) {
    wireframe.push(<CircleWire amplitude={amplitude} key={amplitude} />);
  }
  return (
    <>
      {wireframe}
      <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}>
        <circleGeometry args={[EARTH_RADIUS, 32]} />
        <meshBasicMaterial color={"gray"} wireframe />
      </mesh>
    </>
  );
}

function CircleWire({ amplitude = EARTH_RADIUS, resolution = 90 }: { amplitude?: number, resolution?: number }) {
  const points = useMemo(() => {
    const size = 360 / resolution;
    return Array.from({ length: resolution + 1 }, (_, i) => {
      const segment = (i * size) * Math.PI / 180;
      return new Vector3(Math.cos(segment) * amplitude, 0, Math.sin(segment) * amplitude);
    });
  }, [amplitude, resolution]);
  return (
    <Line points={points} color={"grey"} linewidth={1} />
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

const City = function({ i, cityName }: { i: number, cityName: CityName }) {
  const height = 0.4, nTriangles = 6;
  const coneRef = useRef<ConeGeometry>(null!);
  const meshRef = useRef<Mesh>(null!);
  const { hoveredCityRef, updateHoveredCity, updateCities, setIsDragging, isDragging } = useRenderContext();
  useEffect(() => {
    coneRef.current.translate(0, height / 2, 0);
  }, []);

  useEffect(() => {
    updateCities(cityName, meshRef.current);
  }, [cityName, updateCities]);

  const onHover = () => {
    if (cityName !== hoveredCityRef.current?.name && isDragging === false) {
      updateHoveredCity(cityName);
    }
  }
  const spriteArguments = {
    fontsize: 60,
    borderColor: { r: 225, g: 0, b: 0, a: 1.0 },
    backgroundColor: { r: 225, g: 140, b: 0, a: 0.9 }
  };


  const { lat, lon } = truePositions[cityName];
  return (
    <mesh position={[lat / 3, 0, lon / 3]} ref={meshRef}
      onPointerOver={onHover}
      onPointerDown={() => setIsDragging(true)} // NOTE: Check sprite effects for bugs
      onPointerLeave={() => {
        if (isDragging) return;
        updateHoveredCity(null);
      }}
    >
      <coneGeometry args={[height, height, nTriangles]} ref={coneRef} />
      <meshBasicMaterial color={"#DE1738"} />
      <TextSprite message={String.fromCharCode(65 + i)} parameters={spriteArguments} />
    </mesh>
  )
}


function Cities() {
  return (
    Object.entries(Object.keys(truePositions))
      .map(([i, cityName]) => <City i={+i} cityName={cityName as CityName} key={cityName} />)
  );
}

const Curve = memo(function({ dest, isCorrect }: { dest: Vector3, isCorrect: boolean }) {
  console.log("rerendering");
  const ref = useRef<Mesh>(null!);
  const { hoveredCityRef } = useRenderContext();
  useFrame(() => {
    const pts = [];
    const base = hoveredCityRef.current?.mesh.position;
    if (base === undefined) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    for (let i = 0; i <= 1; i++) {
      const p = new Vector3().lerpVectors(base, dest, i / 1);
      pts.push(p);
    }
    const curve = new CatmullRomCurve3(pts);
    ref.current.geometry.dispose();
    ref.current.geometry = new TubeGeometry(curve, 64, 0.05, 50, false);
  });

  const color = isCorrect ? 0x3acabb : 0xff8400;
  return (
    <mesh ref={ref}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
});

function Curves() {
  const { citiesRef, hoveredCityRef } = useRenderContext();
  const { currDistances } = useUIContext();

  const THRESH = 1;

  if (hoveredCityRef.current === null) return null;

  const cities = citiesRef.current;
  const hoveredCity = hoveredCityRef.current.name;
  const realDistances = getRealDistances();
  const totalCurrent = totalDistance(currDistances);
  const totalReal = totalDistance(realDistances);

  const curves = [];
  for (const cityName of Object.keys(cities) as CityName[]) {
    if (cities[cityName]?.position === undefined) continue;
    const d = Math.abs(currDistances[hoveredCity][cityName] / totalCurrent - realDistances[hoveredCity][cityName] / totalReal);
    if (cityName === 'kiev')
      console.log(d);
    curves.push(<Curve dest={cities[cityName].position} key={cityName} isCorrect={(d < THRESH)} />)
  }


  return <>{curves}</>;

}

