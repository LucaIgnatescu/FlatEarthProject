import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
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
import useSetupSection from "../hooks/useSetupSection.tsx";
import { ProgressOverlay } from "../components/ProgressOverlay.tsx";
import { useNavigate } from "react-router-dom";

export function Tutorial2() {
  useSetupSection(2, 'tutorial2');
  const navigate = useNavigate();
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
        <DynamicContinueButton onClick={() => navigate("/tutorial/3")} useSnapshot={useSnapshot} compareSnapshot={compareSnapshot} />
      </div>
      <ProgressOverlay />
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
      Specifically, the line now indicates that the cities are <span className="text-[#f30836]">{rounded}km too far apart</span>.
    </p>);
  }
  if (color === BLUE) {
    return (<p>
      Specifically, the line now indicates that the cities are <span className="text-[#3479f3]">{rounded}km too close together</span>.
    </p>);
  }
  return (<p>
    Specifically, the line now indicates that the cities are <span className="text-[#006400]">correctly spaced</span>.
  </p>);
}

function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        There are many ways to place these dots correctly.
      </p>
      <p>
        To help you align the cities to reality, there is now a line connecting them.
        It is <span className="text-[#006400]">green</span> when the distance is correct,
        <span className="text-[#3479f3]"> blue</span>  if it's too short,
        and <span className="text-[#f30836]"> red</span> if it's too long.
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

