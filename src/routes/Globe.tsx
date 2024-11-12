import { PerspectiveCamera } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { forwardRef, useEffect, useLayoutEffect } from "react";
import { Mesh, TextureLoader, } from "three";
import { SPHERE_RADIUS } from "../utils";
import { Cities, } from "../components/Cities";
import { Curves } from "../components/Curves";
import { useStore } from "../state";
import { EarthProps, EarthWrapper } from "../components/Earth";
import { Stars } from "../components/Stars";
import { Controls } from "../components/Controls";
import { Sprites } from "../components/TextSprite";
import { AboutMenu, RealDistancesContainer, TotalError, UIContainer } from "../components/UI";
import { ContextMenu } from "../components/ContextMenu";
import { Distances } from "../components/Distances";
import CustomCanvas from "../components/CustomCanvas";

export default function Globe() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const route = useStore(state => state.route);
  const citiesRef = useStore(state => state.citiesRef);
  const nCities = useStore(state => state.nCities);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);

  useLayoutEffect(() => {
    updateRoute('sphere');
    updateNCities(8);
  }, [updateNCities, updateRoute]);

  useEffect(() => {
    if (nRenderedCities === nCities && route === 'sphere') {
      updateHoveredCity('atlanta');
    }
  }, [nCities, citiesRef, nRenderedCities, route]);

  return (
    <>
      <CustomCanvas className="bg-black">
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
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
        <div className="top-0 left-0 fixed w-full h-full z-10">
          <div className="flex w-full h-full flex-col justify-end">
            <div className="flex justify-end w-full">
              <AboutMenu />
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
  const texture = useLoader(TextureLoader, '../../static/img/globe1.jpg');
  return (
    <mesh onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      ref={ref}>
      <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
      <meshBasicMaterial map={texture} />
    </mesh >
  );
});
