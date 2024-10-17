import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useEffect, useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { TotalError, UIContainer } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { DynamicContinueButton } from "../components/ContinueButton.tsx";
import { computeTotalError, getDistancesFast } from "../distances.tsx";
import { Distances } from "../components/Distances.tsx";
import { BLUE, getColor, RED } from "../utils.tsx";
import CustomCanvas from "../components/CustomCanvas.tsx";

export function Tutorial2() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const route = useStore(state => state.route);
  useLayoutEffect(() => {
    updateRoute('tutorial2');
    updateNCities(2);
  }, [updateRoute, updateNCities]);

  useEffect(() => {
    if (nRenderedCities === 2 && route === 'tutorial2') {
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
          <Curves radius={0.2} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </CustomCanvas>
        <UIContainer>
          <div className="w-full flex justify-center invisible">
            <TotalError />
          </div>
          <Distances />
        </UIContainer>
      </div>
      <div className="w-2/5 h-full flex flex-col justify-center p-12 *:my-5">
        <Prompt />
        <DynamicContinueButton dest="/tutorial/3" useSnapshot={useSnapshot} compareSnapshot={compareSnapshot} />
      </div>
    </div>
  );
}



function useDistance() {
  const currPositions = useStore(state => state.currPositions);
  const nCities = useStore(state => state.nRenderedCities);
  const type = useStore(state => state.objectType);
  if (nCities !== 2) return 0;

  const { trueDistance, currDistance } = getDistancesFast('atlanta', 'beijing', type, currPositions);
  const delta = currDistance - trueDistance;

  return delta;
}

function DynamicDistanceExplanation() {
  const hoveredCity = useStore(state => state.hoveredCity);
  const delta = useDistance();
  const color = getColor(delta);
  const rounded = Math.round(Math.abs(delta));
  if (hoveredCity === null) {
    return (<p>
      Try hovering over a point.
    </p>);
  }
  if (color === RED) {
    return (<p>
      More concretely, the line now indicates that the cities are <span className="text-[#f30836]">{rounded}km too far apart</span>.
    </p>);
  }
  if (color === BLUE) {
    return (<p>
      More concretely, the line now indicates that the cities are <span className="text-[#3479f3]">{rounded}km too close together</span>.
    </p>);
  }
  return (<p>
    More concretely, the line now indicates that the cities are <span className="text-[#36f808]">correctly spaced</span>.
  </p>);
}

function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        There are many ways to do this.
      </p>
      <p>
        To help you align the cities to reality, there is a line connecting them.
        It is <span className="text-[#36f808]">green</span> when the distance is correct,
        <span className="text-[#3479f3]"> blue</span>  if too short,
        and <span className="text-[#f30836]"> red</span> if too long.
      </p>
      <p>
        The number above the line indicates how far off you are from matching the real distance.
      </p>
      <DynamicDistanceExplanation />
      <p>
        Match the distance again, using the line as a guide.
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
