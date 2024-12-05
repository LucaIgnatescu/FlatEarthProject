import { PerspectiveCamera } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { forwardRef } from "react";
import { Mesh, TextureLoader, } from "three";
import { SPHERE_RADIUS } from "../utils";
import { Cities, } from "../components/Cities";
import { Curves } from "../components/Curves";
import { EarthProps, EarthWrapper } from "../components/Earth";
import { Stars } from "../components/Stars";
import { Controls } from "../components/Controls";
import { Sprites } from "../components/TextSprite";
import { AboutMenu, ContinueTimeout, RealDistancesContainer, TotalError, UIContainer } from "../components/UI";
import { ContextMenu } from "../components/ContextMenu";
import { Distances } from "../components/Distances";
import CustomCanvas from "../components/CustomCanvas";
import useSetupSection from "../hooks/useSetupSection";

export default function Globe() {
  useSetupSection(8, 'globe');
  return (
    <>
      <CustomCanvas className="bg-black">
        <PerspectiveCamera makeDefault position={[20, 20, 20]} ref={(node) => node?.lookAt(0, 0, 0)} />
        <Controls />
        <EarthWrapper EarthMesh={EarthMesh} />
        <Stars />
        <Cities />
        <Curves />
        <Sprites />
      </CustomCanvas>
      <UIContainer>
        <div className="w-full flex justify-center z-0">
          <TotalError />
        </div>
        <div className="top-0 left-0 fixed w-full h-full z-10 pointer-events-none">
          <div className="flex w-full h-full flex-col justify-end">
            <div className="flex justify-end w-full">
              <AboutMenu />
            </div>
          </div>
        </div>
        <div className="top-0 left-0 fixed w-full h-full z-200 pointer-events-none">
          <div className="flex w-full h-full flex-col justify-end">
            <div className="flex w-full justify-center">
              <ContinueTimeout time={10} text={"Continue"} dest={"survey1"} />
            </div>
          </div>
        </div>
        <RealDistancesContainer />
        <Distances />
        <ContextMenu />
      </UIContainer>
    </>
  );
}

const EarthMesh = forwardRef<Mesh, EarthProps>(({ onPointerMove, onPointerUp }, ref) => {
  const base = import.meta.env.BASE_URL || "/";
  const texture = useLoader(TextureLoader, `${base}img/globe1.jpg`);
  return (
    <mesh onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      ref={ref}>
      <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
      <meshBasicMaterial map={texture} />
    </mesh >
  );
});
