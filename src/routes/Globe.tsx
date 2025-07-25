import { PerspectiveCamera } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { forwardRef } from "react";
import { Mesh, TextureLoader, } from "three";
import { SPHERE_RADIUS } from "../utils";
import { Cities, } from "../components/Cities";
import { Curves } from "../components/Curves";
import { EarthProps, EarthWrapper } from "../components/Earth";
import { Stars } from "../components/Stars";
import { Controls } from "../components/Controls";
import { Sprites } from "../components/TextSprite";
import { AboutMenu, RealDistancesContainer, TotalError, UIContainer } from "../components/UI";
import { ContextMenu } from "../components/ContextMenu";
import { Distances } from "../components/Distances";
import CustomCanvas from "../components/CustomCanvas";
import useSetupSection from "../hooks/useSetupSection";
import { useStore } from "../state";
import { ExitQuestions } from "./Survey2";
import ParticlesWrapper from "../components/ParticlesWrapper";
import { computeTotalError } from "../distances";
import { useNavigate } from "react-router-dom";

export default function Globe() {
  useSetupSection(8, 'globe');
  const completed = useStore(state => state.completed);
  const updateCompleted = useStore(state => state.updateCompleted);
  const navigate = useNavigate();
  return (
    <>
      <CustomCanvas className="bg-black">
        <PerspectiveCamera makeDefault position={[50, 50, 50]} ref={(node) => node?.lookAt(0, 0, 0)} />
        <Controls />
        <EarthWrapper EarthMesh={EarthMesh} />
        <Stars />
        <Cities />
        <Curves />
        <Sprites />
      </CustomCanvas>
      <UIContainer>
        <div className="w-full flex justify-center z-0">
          <TotalError />
        </div>
        <div className="top-0 left-0 fixed w-full h-full z-10 pointer-events-none">
          <div className="flex w-full h-full flex-col justify-end">
            <div className="flex justify-end w-full">
              <AboutMenu />
            </div>
          </div>
        </div>
        {completed &&
          <div className="top-0 left-0 fixed w-full h-full z-200 pointer-events-none">
            <div className="flex w-full h-full flex-col justify-end">
              <div className="flex w-full justify-center">
                <div
                  className="pointer-events-auto bg-[#43CF30] p-2 px-4 text-white hover:cursor-pointer rounded-t-xl"
                  onClick={() => navigate('/planepost')}
                >
                  2D
                </div>
              </div>
            </div>
          </div>
        }
        <RealDistancesContainer />
        <Distances />
        <ContextMenu />
      </UIContainer>
      <ExitSurvey completed={completed} onClick={() => updateCompleted(true)} />
    </>
  );
}
function ExitSurvey({ completed, onClick: onClick }: { completed: boolean, onClick: VoidFunction }) {
  const currPositions = useStore(state => state.currPositions);
  const nCities = useStore(state => state.nCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);

  if (nCities !== nRenderedCities) {
    return null;
  }
  const enabled = !completed && Math.round(computeTotalError('sphere', currPositions)) === 0;
  return (
    <div className={`bg-gray-400 bg-opacity-80 fixed top-0 w-full h-full z-10 transition-all ease-in duration-1000
${enabled ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      {
        enabled &&
        <div className="w-full h-full flex justify-center flex-col">
          <div className="h-4/5 flex w-full justify-center">
            <div className="opacity-100 p-10 bg-white w-1/2 rounded-xl border border-black overflow-y-scroll no-scrollbar">
              <p className="w-full text-xl text-center mb-5 font-bold">Congratulations!</p>
              <p className="w-full border-b border-gray-400 mb-5 text-blue">You have sucessfully completed the challenge! On a sphere, you were able to place 8 cities, while on a plane even 4 were impossible. Now the representation matches reality. <br />
                If you would like to continue playing, please fill out this short survey.
              </p>

              <ExitQuestions action={onClick} />
            </div>
            <ParticlesWrapper />
          </div>
        </div>
      }
    </div>
  );
}

const EarthMesh = forwardRef<Mesh, EarthProps>(({ onPointerMove, onPointerUp }, ref) => {
  const base = import.meta.env.BASE_URL || "/";
  const texture = useLoader(TextureLoader, `${base}img/globe1.jpg`);
  return (
    <mesh onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      ref={ref}>
      <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
      <meshBasicMaterial map={texture} />
    </mesh >
  );
});
