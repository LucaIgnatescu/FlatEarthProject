import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { CityRealDistances, TotalError, UIContainer } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { DynamicContinueButton } from "../components/ContinueButton.tsx";
import { computeTotalError } from "../distances.tsx";
import { ContextMenu } from "../components/ContextMenu.tsx";
import { AnchorPrompt } from "../components/AnchorPrompt.tsx";

export function Tutorial4() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  useLayoutEffect(() => {
    updateRoute('tutorial');
    updateNCities(3);
  })
  return (
    <div className="flex h-full">
      <div className="w-3/5 relative">
        <Canvas className="bg-black w-full" >
          <TutorialControls />
          <ambientLight color={0xffffff} intensity={2} />
          <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities CityMesh={TutorialCityMesh} />
          <Curves radius={0.2} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </Canvas>
        <UIContainer>
          <div className="w-full flex justify-center">
            <TotalError />
            <ContextMenu />
            <AnchorPrompt />
          </div>
        </UIContainer>
      </div>
      <div className="w-2/5 h-full flex flex-col justify-center p-12 *:my-5">
        <Prompt />
        <DynamicContinueButton
          dest="/plane" useSnapshot={useSnapshot} compareSnapshot={compareSnapshot}
        />
        <CityRealDistances />
      </div>
    </div>
  );
}



function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        That was much harder, right?
      </p>
      <p>
        To assist you, we provide two kinds of solvers.
        One matches all the distances to a single point, while the other constructs the best overall solution.
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
