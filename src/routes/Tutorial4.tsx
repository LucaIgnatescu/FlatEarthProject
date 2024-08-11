import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { CitySlider, TotalError, UIWrapper } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { ContextMenu } from "../components/ContextMenu";
import { AnchorPrompt } from "../components/AnchorPrompt";
import { PerspectiveCamera } from "@react-three/drei";
import { ContinueButton } from "../components/ContinueButton.tsx";

export function Tutorial4() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  useLayoutEffect(() => {
    updateRoute('tutorial');
    updateNCities(7);
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
          <Curves radius={0.2} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </Canvas>
        <UIWrapper>
          <div className="w-full flex justify-center">
            <div className="flex flex-col text-white text-center">
              <TotalError />
              <AnchorPrompt />
            </div>
            <ContextMenu />
          </div>
        </UIWrapper>
      </div>
      <div className="w-1/2 flex flex-col justify-center">
        <div className="flex w-full justify-center" >
          <div className="*:my-10 p-10">
            <Prompt />
            <ContinueButton dest="/plane" />
            <CitySlider />
          </div>
        </div>
      </div>
    </div>
  );
}




function Prompt() {
  return (
    <div className="*:my-2 text-lg">
      <p>That was much harder, right?</p>
      <p>To assist you, right-clicking on a city will prompt a helper menu, with individual and global solvers.</p>
      <p>Try seeing how they work!</p>
    </div>
  );
}

