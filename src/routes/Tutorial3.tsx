import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { Cities } from "../components/Cities";
import { AllCurves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { TotalError, UIContainer } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { DynamicContinueButton } from "../components/ContinueButton.tsx";
import { computeTotalError, getDistancesFast } from "../distances.tsx";
import { Distances } from "../components/Distances.tsx";
import { CityName } from "../coordinates.ts";
import CustomCanvas from "../components/CustomCanvas.tsx";
import useSetupSection from "../hooks/useSetupSection.tsx";
import { ProgressOverlay } from "../components/ProgressOverlay.tsx";
import { useNavigate } from "react-router-dom";
import { getColor, GREEN } from "../utils.tsx";

export function Tutorial3() {
  useSetupSection(3, 'tutorial3');
  const navigate = useNavigate();
  return (
    <div className="flex h-full">
      <div className="w-3/5 relative">
        <CustomCanvas className="bg-black w-full" >
          <TutorialControls />
          <ambientLight color={0xffffff} intensity={2} />
          <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities CityMesh={TutorialCityMesh} />
          <AllCurves radius={0.2} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </CustomCanvas>
        <UIContainer>
          <div className="w-full flex justify-center">
            <TotalError />
          </div>
          <Distances />
        </UIContainer>
      </div>
      <div className="w-2/5 h-full flex flex-col justify-center p-12 *:my-5">
        <Prompt />
        <DynamicContinueButton onClick={() => navigate("/tutorial/4")} useSnapshot={useSnapshot} compareSnapshot={compareSnapshot} />
      </div>
      <ProgressOverlay />
    </div>
  );
}


// NOTE: NO
function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        Now, we are adding another city, <span className="text-red">Cape Town</span>.
      </p>
      <p>
        Like before, the lines and numbers between the points represent how close you are to matching the real distances between the cities they represent.
      </p>
      <p>
        In addition, the number on top represents the total discrepancy, which is the sum of all discrepancies.
      </p>
      <TotalErrorWrapper />
      <p>
        The goal of this challenge is to make that number go to
        <span className=""> 0</span>, completely matching reality.
      </p>

      <p className="italic">Hint: as you have seen in the previous two sections,
        there are multiple ways to correctly place just two of the dots at a time.</p>
    </div>
  );
}

function useDelta(city1: CityName, city2: CityName) {
  const type = useStore(state => state.objectType);
  const currPositions = useStore(state => state.currPositions);
  const { currDistance, trueDistance } = getDistancesFast(city1, city2, type, currPositions);
  const delta = currDistance - trueDistance;
  const color = getColor(delta);
  return {
    d: Math.round(Math.abs(delta)),
    color
  };
}

function TotalErrorWrapper() {
  const nRenderedCities = useStore(state => state.nRenderedCities);
  if (nRenderedCities !== 3) return null;
  return <TotalErrorExplanation />
}
function TotalErrorExplanation() {
  const distance1 = useDelta('atlanta', 'beijing');
  const distance2 = useDelta('atlanta', 'cape');
  const distance3 = useDelta('beijing', 'cape');
  const d1 = distance1.d;
  const d2 = distance2.d;
  const d3 = distance3.d;
  const TEMPGREEN = "#006400";
  const color1 = distance1.color !== GREEN ? distance1.color : TEMPGREEN;
  const color2 = distance2.color !== GREEN ? distance2.color : TEMPGREEN;
  const color3 = distance3.color !== GREEN ? distance3.color : TEMPGREEN;
  const totalError = d1 + d2 + d3;
  return (
    <>
      <p>
        The current total discrepancy is computed as
      </p>
      <p className="text-center text-black">
        <span className="font-semibold">{totalError}</span> = <span style={{ color: color1 }}>{d1}</span>
        + <span style={{ color: color2 }}> {d2}</span>
        + <span style={{ color: color3 }}> {d3}</span>
      </p>
    </>
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
