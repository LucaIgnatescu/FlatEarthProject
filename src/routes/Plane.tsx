import { Line, MapControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useLoader } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { CircleGeometry, Mesh, TextureLoader, Vector3 } from "three";
import { UIWrapper } from "../ui";
import { CIRCLE_RADIUS } from "../utils";
import { Stars } from "../components/shared";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { useStore } from "../state";

const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];

export default function Plane() {
  const updateRoute = useStore(state => state.updateRoute);
  useLayoutEffect(() => updateRoute('plane'));
  return (
    <>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[10, 10, 0]} />
        <Controls />
        <ambientLight color={0xffffff} intensity={2} />
        <Cities type="plane" />
        <Earth />
        <EarthWireframe />
        <Stars />
        <Curves type="plane" />
      </Canvas>
      <UIWrapper />
    </>
  );
}

function Controls() {
  const isDragging = useStore(state => state.isDragging);
  return <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} />
}

function Earth() {
  const texture = useLoader(TextureLoader, '../../static/img/disk.png'); // BUG: Earth not receiving intersection without adding onPointerMove

  const isDragging = useStore(state => state.isDragging);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const moveHoveredCity = useStore(state => state.moveHoveredCity);
  const updateIsDragging = useStore(state => state.updateIsDragging);
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
      onPointerUp={() => updateIsDragging(false)}
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
