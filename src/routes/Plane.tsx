import { Line, MapControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { CatmullRomCurve3, CircleGeometry, Mesh, TextureLoader, TubeGeometry, Vector3 } from "three";
import { PlanarDistance, SCALE_FACTOR } from "../utils";
import { CityName } from "../coordinates"; // NOTE: This used to be an array in the original implementation
import { CityTable, ContextProvider, Distances, useRenderContext, useUpdateContext } from "../state";
import { UIWrapper } from "../ui";
import { CIRCLE_RADIUS } from "../utils";
import { Stars } from "../components/shared";
import { Cities } from "../components/Cities";

const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];

export default function Plane() {
  const calculateDistances = (cities: CityTable) => {
    const currDistaces: Distances = {};
    for (const [cityName1, cityMesh1] of Object.entries(cities) as [CityName, Mesh][]) {
      for (const [cityName2, cityMesh2] of Object.entries(cities) as [CityName, Mesh][]) {
        const distance = PlanarDistance(cityMesh1, cityMesh2) * SCALE_FACTOR;
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
        <PerspectiveCamera makeDefault position={[10, 10, 0]} />
        <Controls />
        <ambientLight color={0xffffff} intensity={2} />
        <Cities type="plane" />
        <Earth />
        <EarthWireframe />
        <Stars />
        <Curves />
      </Canvas>
      <UIWrapper />
    </ContextProvider>
  );
}

function Controls() {
  const { isDragging } = useRenderContext();
  return <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} />
}

function Earth() {
  const texture = useLoader(TextureLoader, '../../static/img/disk.png'); // BUG: Earth not receiving intersection without adding onPointerMove
  const { isDragging, hoveredCityRef } = useRenderContext();
  const { moveHoveredCity, setIsDragging, } = useUpdateContext();

  const dragCity = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !hoveredCityRef.current) return;
    const earthIntersection = event.intersections.find(
      (intersection) => ((intersection.object as Mesh).geometry instanceof CircleGeometry)
    );
    if (earthIntersection === undefined) throw new Error("Didn't intersect earth");
    const { x, z } = earthIntersection.point;
    const { y } = hoveredCityRef.current.mesh.position;
    moveHoveredCity(x, y, z);
  }
  return (
    <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}
      onPointerUp={() => setIsDragging(false)}
      onPointerMove={dragCity}>
      <circleGeometry args={[CIRCLE_RADIUS, 64]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function EarthWireframe() {
  const wireframe = [];
  for (let amplitude = 0; amplitude < CIRCLE_RADIUS; amplitude += 10) {
    wireframe.push(<CircleWire amplitude={amplitude} key={amplitude} />);
  }
  return (
    <>
      {wireframe}
      <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}>
        <circleGeometry args={[CIRCLE_RADIUS, 32]} />
        <meshBasicMaterial color={"gray"} wireframe />
      </mesh>
    </>
  );
}

function CircleWire({ amplitude = CIRCLE_RADIUS, resolution = 90 }: { amplitude?: number, resolution?: number }) {
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

function Curve({ dest }: { dest: Vector3 }) {
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

  const color = 0x3acabb;
  return (
    <mesh ref={ref}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Curves() {
  const { citiesRef, hoveredCityRef } = useRenderContext();
  if (hoveredCityRef.current === null) return null;
  const cities = citiesRef.current;
  const curves = [];
  for (const cityName of Object.keys(cities) as CityName[]) {
    if (cities[cityName]?.position === undefined) continue;
    curves.push(<Curve dest={cities[cityName].position} key={cityName} />)
  }
  return curves;
}

