import { ThreeEvent, useLoader } from "@react-three/fiber";
import { Mesh, RepeatWrapping, TextureLoader } from "three";
import { CIRCLE_RADIUS } from "../utils";
import { useStore } from "../state";
import { MapControls } from "@react-three/drei";
import { TextSpriteFactory } from "./TextSprite";
import { forwardRef } from "react";
import { CityProps } from "./Cities";

export function TutorialEarthMesh({ dragCity, onPointerUp }: {
  dragCity: (event: ThreeEvent<PointerEvent>) => void,
  onPointerUp: (event?: ThreeEvent<PointerEvent>) => void
}) {
  const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];
  const texture = useLoader(TextureLoader, "../../static/img/grid.jpg");
  texture.repeat.set(1, 1);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return (
    <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}
      onPointerUp={onPointerUp}
      onPointerMove={dragCity}>
      <circleGeometry args={[CIRCLE_RADIUS, 64]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}


export function TutorialControls() {
  const isDragging = useStore(state => state.isDragging);
  return <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} /> // TODO: Set a decent position
}


export const TutorialTextSprite = TextSpriteFactory({ fontsize: 50, scale: [20, 10, 1] });
export const TutorialCityMesh = forwardRef<Mesh, CityProps>((props, meshRef) => {
  const radius = 1;
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} {...props} >
      <sphereGeometry args={[radius]} />
      <meshBasicMaterial color={"red"} />
    </mesh >);
});

