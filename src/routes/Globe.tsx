import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useLoader } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { TextureLoader, } from "three";
import { SPHERE_RADIUS } from "../utils";
import { Cities, } from "../components/Cities";
import { Curves } from "../components/Curves";
import { useStore } from "../state";
import { EarthWrapper } from "../components/Earth";
import { Stars } from "../components/Stars";
import { Controls } from "../components/Controls";
import { Sprites } from "../components/TextSprite";
import { TotalError, UIWrapper } from "../components/UI";
import { ContextMenu } from "../components/ContextMenu";
import { AnchorPrompt } from "../components/AnchorPrompt";

export default function Globe() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  useLayoutEffect(() => {
    updateRoute('sphere');
    updateNCities(8);
  })
  return (
    <>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <Controls />
        <EarthWrapper EarthMesh={EarthMesh} />
        <Stars />
        <Cities />
        <Curves />
        <Sprites />
      </Canvas>
      <UIWrapper>
        <div className="w-full flex justify-center text-white text-center">
          <div className="flex flex-col">
            <TotalError />
            <AnchorPrompt />
          </div>
        </div>
        <ContextMenu />
      </UIWrapper>
    </>
  );
}

function EarthMesh({ onPointerMove, onPointerUp }: {
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void,
  onPointerUp: (event?: ThreeEvent<PointerEvent>) => void
}) {
  const texture = useLoader(TextureLoader, '../../static/img/globe1.jpg');
  return (
    <mesh onPointerUp={onPointerUp}
      onPointerMove={onPointerMove} >
      <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
      <meshBasicMaterial map={texture} />
    </mesh >
  );
}

