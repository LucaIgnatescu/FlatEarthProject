import { useLoader } from "@react-three/fiber";
import { Mesh, RepeatWrapping, TextureLoader } from "three";
import { CIRCLE_RADIUS } from "../utils";
import { useStore } from "../state";
import { MapControls } from "@react-three/drei";
import { TextSpriteFactory } from "./TextSprite";
import { forwardRef } from "react";
import { CityProps } from "./Cities";
import { EarthProps } from "./Earth";


export const TutorialEarthMesh = forwardRef<Mesh, EarthProps>(({ onPointerMove, onPointerUp }, ref) => {
  const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];
  const texture = useLoader(TextureLoader, "/img/grid.jpg");
  texture.repeat.set(1, 1);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return (
    <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]} ref={ref}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove} >
      <circleGeometry args={[CIRCLE_RADIUS, 64]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh >
  );
});


export function TutorialControls() {
  const controlsEnabled = useStore(state => state.controlsEnabled);
  return <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={controlsEnabled} /> // TODO: Set a decent position
}


export const TutorialTextSprite = TextSpriteFactory({ fontsize: 50, scale: [20, 10, 1] });
export const TutorialCityMesh = forwardRef<Mesh, CityProps>((props, meshRef) => {
  const radius = 2;
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} {...props} >
      <sphereGeometry args={[radius]} />
      <meshBasicMaterial color={"red"} />
    </mesh >);
});

export function TutorialContainer({ children }: { children: JSX.Element | JSX.Element[] }) {
  return (
    <div className="w-full h-full flex flex-col justify-center p-12">
      {children}
    </div>
  );
}

