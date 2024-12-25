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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IntakeSurvey } from "./Survey1.tsx";

export function Tutorial5() {
  useSetupSection(3, 'tutorial5');
  const [done, setDone] = useState(false);

  const onClick = () => setDone(true);
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
        <DynamicContinueButton onClick={onClick} useSnapshot={useSnapshot} compareSnapshot={compareSnapshot}
          text="Proceed to Challenge"
        />
      </div>
      <ProgressOverlay />
      <Questions enabled={done} />
    </div>
  );
}

function Questions({ enabled }: { enabled: boolean }) {
  const navigate = useNavigate();
  return (
    <div className={`bg-gray-400 bg-opacity-80 fixed top-0 w-full h-full z-10 transition-all ease-in duration-1000
${enabled ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <div className="w-full h-full flex justify-center flex-col">
        <div className="h-4/5 flex w-full justify-center">
          <div className="opacity-100 p-10 bg-white w-1/2 rounded-xl border-2 border-black overflow-scroll">
            <p className="w-full text-xl text-center mb-5 font-bold">Intake Survey</p>
            <p className="mt-5 w-full border-b border-gray-400 mb-5 text-blue">Before continuing, please fill in this short survey.</p>
            <IntakeSurvey action={() => navigate('/plane')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Prompt() {
  const { visible } = useStore(state => state.contextMenu);
  const [everVisible, setEverVisible] = useState(visible);

  useEffect(() => {
    if (visible === true) {
      setEverVisible(true);
    }
  }, [visible])
  return (
    <div className="*:my-2 text-xl">
      <p>
        As you may have noticed, the more cities are added, the harder this task becomes.
      </p>
      <p>
        Therefore, to assist you, we provide two kinds of solvers.
      </p>
      <p>
        Right click on a point to continue.
      </p>
      <div className={`transition duration-1000 ${everVisible ? "opacity-100" : "opacity-0"}`}>
        <p>
          The first, indicated by the <span className="font-bold">Solve City</span> button, ensures that all distances to the selected city are matched.</p>
        <p className="my-2">
          The second, indicated by the <span className="font-bold">Solve Globally</span> button, constructs the configuration that will ensure the smallest possible discrepancy. Note that this is not necessarily 0.
        </p>

        <p className="mt-2">
          Try using both to see how they work.
        </p>
      </div>
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
