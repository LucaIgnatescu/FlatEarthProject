import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useLoader } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { TextureLoader, } from "three";
import { SPHERE_RADIUS } from "../utils";
import { Cities, } from "../components/Cities";
import { Curves } from "../components/Curves";
import { useStore } from "../state";
import { UIWrapper } from "../ui";
import { EarthWrapper } from "../components/Earth";
import { Stars } from "../components/Stars";
import { Controls } from "../components/Controls";
import { Sprites } from "../components/TextSprite";

export default function Globe() {
  const updateRoute = useStore(state => state.updateRoute);
  useLayoutEffect(() => { updateRoute('sphere') }
  );
  return (
    <>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <Controls type="sphere" />
        <EarthWrapper EarthMesh={EarthMesh} />
        <Stars />
        <Cities type="sphere" />
        <Curves type="sphere" />
        <Sprites type="sphere" />
      </Canvas>
      <UIWrapper />
    </>
  );
}



function EarthMesh({ dragCity, onPointerUp }: {
  dragCity: (event: ThreeEvent<PointerEvent>) => void,
  onPointerUp: (event?: ThreeEvent<PointerEvent>) => void
}) {
  const texture = useLoader(TextureLoader, '../../static/img/globe1.jpg');
  return (
    <mesh onPointerUp={onPointerUp}
      onPointerMove={dragCity} >
      <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
      <meshBasicMaterial map={texture} />
    </mesh >
  );
}

