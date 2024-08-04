import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { EarthWrapper } from "../components/Earth";
import { CIRCLE_RADIUS, RED } from "../utils";
import { useStore } from "../state";
import { MapControls } from "@react-three/drei";
import { RepeatWrapping, TextureLoader } from "three";
import { useLayoutEffect } from "react";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";


export default function Tutorial() {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);

  useLayoutEffect(() => {
    updateRoute('tutorial');
    updateNCities(2);
  })
  return (
    <div className="flex h-full">
      <TaskManager>
        <div className="w-1/2">
          <Canvas className="bg-black w-full" >
            <Controls />
            <ambientLight color={0xffffff} intensity={2} />
            <EarthWrapper EarthMesh={EarthMesh} />
            <Cities type="plane" />
            <Curves type="plane" />
          </Canvas>
        </div>
        <div className="w-1/2 flex flex-col justify-center">
          <div className="flex w-full justify-center" >
            <Prompt />
          </div>
        </div>
      </TaskManager>
    </div>
  );
}

function EarthMesh({ dragCity, onPointerUp }: {
  dragCity: (event: ThreeEvent<PointerEvent>) => void,
  onPointerUp: (event?: ThreeEvent<PointerEvent>) => void
}) {
  const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];
  const texture = useLoader(TextureLoader, "../../static/img/grid.jpg");
  texture.repeat.set(1, 1);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return (
    <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}
      onPointerUp={onPointerUp}
      onPointerMove={dragCity}>
      <circleGeometry args={[CIRCLE_RADIUS, 64]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export function Controls() {
  const isDragging = useStore(state => state.isDragging);
  return <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} /> // TODO: Set a decent position
}


function Prompt() {
  return (
    <div className="text-lg p-10">
      <p>
        On the left, there are two points, highlighed in <span className={`text-[#${RED.toString(16)}]`}>orange</span>.
        You can click and drag to move them.
      </p>
      <p>
        Try it out.
      </p>
    </div>

  );
}

function TaskManager({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
