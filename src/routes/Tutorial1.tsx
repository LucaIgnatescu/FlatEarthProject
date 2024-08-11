import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { CitySlider, TotalError, UIWrapper } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";
import { ContinueButton, DynamicContinueButton } from "../components/ContinueButton.tsx";

export function Tutorial1() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  useLayoutEffect(() => {
    updateRoute('tutorial');
    updateNCities(2);
  })
  return (
    <div className="flex h-full">
      <div className="w-1/2 relative">
        <Canvas className="bg-black w-full" >
          <TutorialControls />
          <ambientLight color={0xffffff} intensity={2} />
          <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities CityMesh={TutorialCityMesh} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </Canvas>
      </div>
      <div className="w-1/2 flex flex-col justify-center">
        <div className="flex w-full justify-center" >
          <div className="*:my-10 p-10">
            <Prompt />
            <DynamicContinueButton dest="/tutorial/2" useSnapshot={useSnapshot} />
          </div>
        </div>
      </div>
    </div>
  );
}




function Prompt() {
  return (
    <div className="text-lg">
      <p>
        On the left, there are two points, highlighed in <span className="text-[#ff8400]">orange</span>.
        You can click and drag to move them.
      </p>
    </div>
  );
}


function useSnapshot() {
  const currPositions = useStore(state => state.currPositions);
  return { currPositions }
}

