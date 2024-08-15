import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { TotalError, UIContainer } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { DynamicContinueButton } from "../components/ContinueButton.tsx";
import { computeTotalError } from "../distances.tsx";

export function Tutorial1() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  useLayoutEffect(() => {
    updateRoute('tutorial');
    updateNCities(2);
  })
  return (
    <div className="flex h-full ">
      <div className="w-3/5 relative">
        <Canvas className="bg-black w-full " >
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
          </div>
        </UIContainer>
      </div>
      <div className="w-2/5 h-full flex flex-col justify-center p-12 *:my-5">
        <Prompt />
        <DynamicContinueButton dest="/tutorial/2" useSnapshot={useSnapshot} compareSnapshot={compareSnapshot} />
      </div>
    </div>
  );
}




function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        The points on the left represent two cities,
        Atlanta and Beijing.
        They are known to be <span className="text-red">11550 km</span> apart.
      </p>
      <p>
        The number at the top indicates how far off the current distance is from this value.
      </p>
      <p>
        Move the points around such that the error decreases to <span className="text-green">0</span>.
      </p>
    </div>
  );
}


function useSnapshot() {
  const currPositions = useStore(state => state.currPositions);
  const type = useStore(state => state.objectType);
  const totalError = computeTotalError(type, currPositions);
  return { totalError };
}

function compareSnapshot(current: { totalError: number } | null) {
  if (current === null) return false;
  const THRESH = 100;
  const { totalError } = current;
  return totalError < THRESH;
}

