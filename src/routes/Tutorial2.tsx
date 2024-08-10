import { Canvas } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { useStore } from "../state";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { alphabeticLabelStrategy, Sprites } from "../components/TextSprite";
import { ContinueButton, TotalError, UIWrapper } from "../components/UI";
import { TutorialCityMesh, TutorialControls, TutorialEarthMesh, TutorialTextSprite } from "../components/TutorialDefaults";
import { PerspectiveCamera } from "@react-three/drei";


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
          <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
          <EarthWrapper EarthMesh={TutorialEarthMesh} />
          <Cities CityMesh={TutorialCityMesh} />
          <Curves radius={0.2} />
          <Sprites generateLabels={alphabeticLabelStrategy} TextSprite={TutorialTextSprite} />
        </Canvas>
        <UIWrapper>
          <div className="w-full flex justify-center">
            <TotalError />
          </div>
        </UIWrapper>
      </div>
      <div className="w-1/2 flex flex-col justify-center">
        <div className="flex w-full justify-center" >
          <div className="*:my-10 p-10">
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
        It is <span className="text-[#ff8400]">orange</span> when incorrect, and otherwise <span className="text-[#3acabb]"> green</span>.
      </p>
      <p>
        Try to move the points such that the error decreases to <span className="text-[#3acabb]">0 </span>.
      </p>
    </div>
  );
}

