import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useEffect, useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { AllCurves, Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { RealDistances, TotalError, UIContainer } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { DynamicContinueButton } from "../components/ContinueButton.tsx";
import { computeTotalError } from "../distances.tsx";
import { Distances } from "../components/Distances.tsx";

export function Tutorial3() {

  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const route = useStore(state => state.route);
  useLayoutEffect(() => {
    updateRoute('tutorial3');
    updateNCities(3);
  }, [updateRoute, updateNCities]);

  useEffect(() => {
    if (nRenderedCities === 3 && route === 'tutorial3') {
      updateHoveredCity('atlanta');
    }
  }, [nRenderedCities, updateHoveredCity, route])
  return (
    <div className="flex h-full">
      <div className="w-3/5 relative">
        <Canvas className="bg-black w-full" >
          <TutorialControls />
          <ambientLight color={0xffffff} intensity={2} />
          <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities CityMesh={TutorialCityMesh} />
          <AllCurves radius={0.2} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </Canvas>
        <UIContainer>
          <div className="w-full flex justify-center">
            <TotalError />
          </div>
          <div className="px-10">
            <RealDistances />
          </div>
          <Distances />
        </UIContainer>
      </div>
      <div className="w-2/5 h-full flex flex-col justify-center p-12 *:my-5">
        <Prompt />
        <DynamicContinueButton dest="/tutorial/4" useSnapshot={useSnapshot} compareSnapshot={compareSnapshot} />
      </div>
    </div>
  );
}


// NOTE: NO
function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        Now, we are adding another city, <span className="text-red">Cape Town</span>. Thus, each city has two distances to other cities.
      </p>
      <p>
        Like before, the lines and numbers between the points represent how close you are to matching the real distances between the cities they represent.
      </p>
      <p>
        In addition, the number on top represents the total discrepancy, i.e. the sum of all discrepancies.
        The goal of this challenge is to make that number go to
        <span className="text-[#4824DB]"> 0</span>, completely matching reality.
      </p>

      <p className="italic">Hint: as you have seen in the previous two sections,
        there are multiple ways to correctly place just two of the dots at a time.</p>
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
