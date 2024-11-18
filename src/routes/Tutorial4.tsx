import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
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
import useSetupSection from "../hooks/useSetupSection.tsx";
import { ProgressOverlay } from "../components/ProgressOverlay.tsx";

export function Tutorial4() {
  useSetupSection(3, 'tutorial4');
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
          dest="/tutorial/5" useSnapshot={useSnapshot} compareSnapshot={compareSnapshot}
        />
      </div>
      <ProgressOverlay />
    </div>
  );
}



function Prompt() {
  return (
    <div className="*:my-2 text-xl">
      <p>
        From now on, to reduce clutter, only the lines originating from the hovered city will be shown.
      </p>
      <p>
        Additionally, for your reference, the menu in the top left shows the real distances between the hovered city and the rest. It can be toggled on or off by clicking the arrow.
      </p>
      <p>
        Match the cities again, just as you did in the previous section.
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
