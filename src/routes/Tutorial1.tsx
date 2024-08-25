import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { CityRealDistances, UIContainer } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { DynamicContinueButton } from "../components/ContinueButton.tsx";
import { computeTotalError, getDistancesFast } from "../distances.tsx";
import { getColor } from "../utils.tsx";

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
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </Canvas>
        <UIContainer>
          <div className="w-full flex justify-center">
            <CurrentDistance />
          </div>
        </UIContainer>
      </div>
      <div className="w-2/5 h-full flex flex-col justify-center p-12 *:my-5">
        <Prompt />
        <CityRealDistances />
        <DynamicContinueButton dest="/tutorial/2" useSnapshot={useSnapshot} compareSnapshot={compareSnapshot} />
      </div>
    </div>
  );
}

function CurrentDistance() {
  const currPositions = useStore(state => state.currPositions);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const type = useStore(state => state.objectType);

  if (nRenderedCities !== 2) {
    return (
      <div className="text-white p-10 text-4xl pointer-events-none">
        0
      </div>
    );
  }
  const { currDistance } = getDistancesFast('atlanta', 'beijing', type, currPositions);

  return <div className="text-white p-10 text-4xl pointer-events-none">{Math.round(Math.abs(currDistance) / 10) * 10}</div>
}

function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        The points on the left represent two cities,
        <span className="text-red"> Atlanta </span>
        and
        <span className="text-red"> Beijing</span>.
        They are known to be  11550 km apart in reality.
      </p>
      <p>
        On the left, these cities are now <PromptDistance /> km apart.
        Can you make the representation match reality by dragging the cities around?
      </p>
    </div>
  );
}

function PromptDistance() {
  const currPositions = useStore(state => state.currPositions);
  const nCities = useStore(state => state.nRenderedCities);
  const type = useStore(state => state.objectType);
  if (nCities !== 2) return <>0</>;

  const { trueDistance, currDistance } = getDistancesFast('atlanta', 'beijing', type, currPositions);
  const delta = trueDistance - currDistance;
  const color = getColor(delta);

  return <span style={{ color: `#${color.toString(16)}` }}>{Math.round(Math.abs(currDistance) / 10) * 10}</span>
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

