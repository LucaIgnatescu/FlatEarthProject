import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { ContinueButton, TotalError, UIWrapper } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { ContextMenu } from "../components/ContextMenu";
import { AnchorPrompt } from "../components/AnchorPrompt";


export function Tutorial4() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  useLayoutEffect(() => {
    updateRoute('tutorial');
    updateNCities(3);
  })
  return (
    <div className="flex h-full">
      <div className="w-1/2 relative">
        <Canvas className="bg-black w-full" >
          <TutorialControls />
          <ambientLight color={0xffffff} intensity={2} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities type="plane" CityMesh={TutorialCityMesh} />
          <Curves type="plane" radius={0.2} />
          <Sprites type="plane" generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
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
          <div className="*:my-10">
            <Prompt />
            <ContinueButton dest="/tutorial/5" />
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

