import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { TotalError, UIWrapper } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { ContinueButton, DynamicContinueButton } from "../components/ContinueButton.tsx";
import { CityName } from "../coordinates.ts";
import { getDistancesFast } from "../distances.tsx";

export function Tutorial3() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  useLayoutEffect(() => {
    updateRoute('tutorial');
    updateNCities(3);
  })
  return (
    <div className="flex h-full">
      <div className="w-1/2 relative">
        <Canvas className="bg-black w-full" >
          <TutorialControls />
          <ambientLight color={0xffffff} intensity={2} />
          <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities CityMesh={TutorialCityMesh} />
          <Curves radius={0.2} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </Canvas>
        <UIWrapper>
          <div className="w-full flex justify-center">
            <TotalError />
          </div>
        </UIWrapper>
      </div>
      <div className="w-1/2 flex flex-col justify-center">
        <div className="flex w-full justify-center" >
          <div className="*:my-10 p-10" >
            <Prompt />
            <DynamicContinueButton dest="/tutorial/4" useSnapshot={useSnapshot} compareSnapshot={compareSnapshot} />
          </div>
        </div>
      </div>
    </div>
  );
}




function Prompt() {
  return (
    <div className="*:my-2 text-lg">
      <p>Now, attempt to do the same, but with 3 points.</p>
      <p>Be mindful of both the total distance, and the pairwise distances indicated by the lines.</p>
    </div>
  );
}

type T = { delta: number }

function useSnapshot(): T | null {
  const currPositions = useStore(state => state.currPositions);
  const cities = Object.keys(currPositions) as CityName[];
  const type = useStore(state => state.objectType);
  if (cities.length < 2) return null;
  const { trueDistance, currDistance } = getDistancesFast(cities[0], cities[1], type, currPositions);
  return { delta: Math.abs(trueDistance - currDistance) };
}

function compareSnapshot(current: T | null) {
  if (current === null) return false;
  const THRESH = 50;
  const { delta } = current;
  return delta < THRESH;
}
