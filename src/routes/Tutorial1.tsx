import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useEffect, useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { UIContainer } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { DynamicContinueButton } from "../components/ContinueButton.tsx";
import { computeTotalError, getDistancesFast } from "../distances.tsx";
import { getColor, GREEN } from "../utils.tsx";
import SetupEvents from "../components/SetupEvents.tsx";
import CustomCanvas from "../components/CustomCanvas.tsx";

export function Tutorial1() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const route = useStore(state => state.route);
  useLayoutEffect(() => {
    updateRoute('tutorial1');
    updateNCities(2);
  }, [updateRoute, updateNCities]);

  useEffect(() => {
    if (nRenderedCities === 2 && route === 'tutorial1') {
      updateHoveredCity('atlanta');
    }
  }, [nRenderedCities, updateHoveredCity, route])


  return (
    <div className="flex h-full ">
      <div className="w-3/5 relative">
        <CustomCanvas className="bg-black w-full " >
          <TutorialControls />
          <ambientLight color={0xffffff} intensity={2} />
          <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities CityMesh={TutorialCityMesh} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </CustomCanvas>
        <UIContainer>
          <div className="w-full flex justify-center invisible">
            <CurrentDistance />
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
  const currPositions = useStore(state => state.currPositions);
  const type = useStore(state => state.objectType);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  let currDistance = 0, color = GREEN;
  if (nRenderedCities === 2) {
    const res = getDistancesFast('atlanta', 'beijing', type, currPositions);
    currDistance = res.currDistance;
    const trueDistance = res.trueDistance;
    const delta = -trueDistance + currDistance;
    color = getColor(delta);
  }

  return (
    <div className="*:my-2 text-xl">
      <p>
        The dots on the left represent two cities,
        <span className="text-red"> Atlanta </span>
        and
        <span className="text-red"> Beijing</span>.
        They are known to be  11550 km apart in reality.
      </p>
      <p>
        In the representation on the left, these cities are now <span style={{ color: `#${color.toString(16)}` }} className="text-2xl">{Math.round(Math.abs(currDistance) / 10) * 10}</span> km apart. You can click and drag to move them around.
      </p>
      <p>
        Can you make the representation match reality?
      </p>
      <p>
        The <span style={{ color: `#${color.toString(16)}` }} className="text-2xl">
          number
        </span> above
        changes as you move the dots.
        Use it as a guide.
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

