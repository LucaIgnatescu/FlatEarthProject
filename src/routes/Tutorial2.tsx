import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { ContinueButton, TotalError, UIWrapper } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";


export function Tutorial2() {
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
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities type="plane" CityMesh={TutorialCityMesh} />
          <Curves type="plane" radius={0.2} />
          <Sprites type="plane" generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </Canvas>
        <UIWrapper>
          <div className="w-full flex justify-center">
            <TotalError />
          </div>
        </UIWrapper>
      </div>
      <div className="w-1/2 flex flex-col justify-center">
        <div className="flex w-full justify-center" >
          <div className="*:my-10">
            <Prompt />
            <ContinueButton dest="/tutorial/3" />
          </div>
        </div>
      </div>
    </div>
  );
}




function Prompt() {
  return (
    <div className="*:my-2 text-lg">
      <p>
        This challenge is all about distances.
      </p>
      <p>
        On the top left side, an error value is displayed. It is the difference between the 'correct' distance, and the actual distance between the points.
      </p>
      <p>
        The error between a pair of points is also indicated by their respective line.
        It is <span className="text-[#ff8400]">orange</span> when incorrect, or otherwise <span className="text-[#3acabb]"> green</span>.
      </p>
      <p>
        Try to move the points, such that the error decreases to 0.
      </p>
    </div>
  );
}

