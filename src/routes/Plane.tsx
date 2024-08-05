import { Line, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useLoader } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { TextureLoader, Vector3 } from "three";
import { CIRCLE_RADIUS } from "../utils";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { useStore } from "../state";
import { EarthWrapper } from "../components/Earth";
import { Controls } from "../components/Controls";
import { Stars } from "../components/Stars";
import { Sprites } from "../components/TextSprite";
import { ContextMenu } from "../components/ContextMenu";
import { UIWrapper } from "../components/UI";
import { AnchorPrompt } from "../components/AnchorPrompt";

const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];

export default function Plane() {
  const updateRoute = useStore(state => state.updateRoute);
  useLayoutEffect(() => updateRoute('plane'));
  return (
    <>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[10, 10, 0]} />
        <Controls type="plane" />
        <ambientLight color={0xffffff} intensity={2} />
        <Cities type="plane" />
        <EarthWrapper EarthMesh={EarthMesh} />
        <EarthWireframe />
        <Stars />
        <Curves type="plane" />
        <Sprites type="plane" />
      </Canvas>
      <UIWrapper>
        <ContextMenu />
        <AnchorPrompt />
      </UIWrapper>
    </>
  );
}


function EarthMesh({ dragCity, onPointerUp }: {
  dragCity: (event: ThreeEvent<PointerEvent>) => void,
  onPointerUp: (event?: ThreeEvent<PointerEvent>) => void
}) {
  const texture = useLoader(TextureLoader, '../../static/img/disk.png');
  return (
    <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}
      onPointerUp={onPointerUp}
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
