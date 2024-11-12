import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useEffect, useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { RealDistancesContainer, TotalError, UIContainer } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { DynamicContinueButton } from "../components/ContinueButton.tsx";
import { computeTotalError } from "../distances.tsx";
import { ContextMenu } from "../components/ContextMenu.tsx";
import { Distances } from "../components/Distances.tsx";
import CustomCanvas from "../components/CustomCanvas.tsx";

export function Tutorial5() {

  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const route = useStore(state => state.route);
  useLayoutEffect(() => {
    updateRoute('tutorial5');
    updateNCities(3);
  }, [updateRoute, updateNCities]);

  useEffect(() => {
    if (nRenderedCities === 3 && route === 'tutorial5') {
      updateHoveredCity('atlanta');
    }
  }, [nRenderedCities, updateHoveredCity, route]);

  return (
    <div className="flex h-full">
      <div className="w-3/5 relative">
        <CustomCanvas className="bg-black w-full" >
          <TutorialControls />
          <ambientLight color={0xffffff} intensity={2} />
          <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities CityMesh={TutorialCityMesh} />
          <Curves radius={0.2} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </CustomCanvas>
        <UIContainer>
          <div className="w-full flex justify-center">
            <TotalError />
          </div>
          <RealDistancesContainer />
          <Distances />
          <ContextMenu />
        </UIContainer>
      </div>
      <div className="w-2/5 h-full flex flex-col justify-center p-12 *:my-5">
        <Prompt />
        <DynamicContinueButton
          dest="/plane" useSnapshot={useSnapshot} compareSnapshot={compareSnapshot}
        />
      </div>
    </div>
  );
}



function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        As you may have noticed, the more cities are added, the harder this task becomes.
      </p>
      <p>
        Therefore, to assist you, we provide two kinds of solvers.
      </p>
      <p>
        The first, indicated by the <span className="font-bold">Solve City</span> button, ensures that all distances to the selected city are matched.<br />
        The second, indicated by the <span className="font-bold">Solve Globally</span> button, constructs the configuration that will ensure the smallest possible discrepancy. Note that this is not necessarily 0.
      </p>
      <p>
        Try right-clicking on a point to see how they work.
      </p>
    </div>
  );
}

type T = { totalError: number }

function useSnapshot(): T {
  const currPositions = useStore(state => state.currPositions);
  const type = useStore(state => state.objectType);
  const totalError = computeTotalError(type, currPositions);
  return { totalError };
}

function compareSnapshot(current: T | null) {
  if (current === null) return false;
  const THRESH = 50;
  const { totalError } = current;
  return totalError < THRESH;
}
