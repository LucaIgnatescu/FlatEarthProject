import { Line, PerspectiveCamera } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { forwardRef, useMemo, useState } from "react";
import { Mesh, TextureLoader, Vector3 } from "three";
import { CIRCLE_RADIUS } from "../utils";
import { Cities, CityProps } from "../components/Cities";
import { Curves } from "../components/Curves";
import { EarthProps, EarthWrapper } from "../components/Earth";
import { Controls } from "../components/Controls";
import { Stars } from "../components/Stars";
import { Sprites, TextSpriteFactory } from "../components/TextSprite";
import { ContextMenu } from "../components/ContextMenu";
import { AboutMenu, ContinueTimeout, RealDistancesContainer, TotalError, UIContainer } from "../components/UI";
import { Distances } from "../components/Distances";
import CustomCanvas from "../components/CustomCanvas";
import useSetupSection from "../hooks/useSetupSection";
import { useNavigate } from "react-router-dom";

const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];

export default function Plane() {
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [popupEverShown, setPopupEverShown] = useState(false);
  const navigate = useNavigate();
  useSetupSection(4, 'plane');

  const onClick = () => {
    if (popupEverShown) {
      return navigate('/globe');
    }
    return setPopupEnabled(true);
  }

  const clickClose = () => {
    setPopupEnabled(false);
    setPopupEverShown(true);
  }
  const clickContinue = () => {
    return navigate('/globe');
  }
  return (
    <>
      <CustomCanvas className="bg-black">
        <PerspectiveCamera makeDefault position={[100, 100, 100]} ref={(node) => node?.lookAt(0, 0, 0)} />
        <Controls />
        <ambientLight color={0xffffff} intensity={2} />
        <Cities CityMesh={CityMesh} />
        <EarthWrapper EarthMesh={EarthMesh} />
        <EarthWireframe />
        <Stars />
        <Curves />
        <Sprites TextSprite={TextSprite} />
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
        <div className="top-0 left-0 fixed w-full h-full z-200 pointer-events-none">
          <div className="flex w-full h-full flex-col justify-end">
            <div className="flex w-full justify-center">
              <ContinueTimeout time={60} text={"Give Up"} onClick={onClick} />
            </div>
          </div>
        </div>
        <RealDistancesContainer />
        <Distances />
        <ContextMenu />
        <Popup enabled={popupEnabled} clickClose={clickClose} clickContinue={clickContinue} />
      </UIContainer>
    </>
  );
}

function Popup({ enabled, clickClose, clickContinue }: { enabled: boolean, clickClose: () => void, clickContinue: () => void }) {
  return (
    <div className={`bg-gray-400 bg-opacity-40 fixed top-0 w-full h-full z-10 transition-all ease-in duration-1000
${enabled ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      {
        enabled &&
        <div className="w-full h-full flex justify-center flex-col">
          <div className="h-fit flex w-full justify-center">
            <div className="opacity-100 p-10 bg-white w-1/2 rounded-xl border border-black overflow-y-scroll no-scrollbar text-l *:my-3">
              <p>
                As you may have noticed, by just adding a fourth city, the number at the top never seems to go to 0, no matter how hard you try.
                However, if the Earth were flat and the real distances measured on a planar surface, it should be possible to create a perfect representation of reality by completely matching all distances.
              </p>
              <p>The only reason for this impossibility is that these distances were not in fact measured on a plane, but on some other type of surface.</p>
              <p>If you still are not conviced, click close and keep trying. If not, continue.</p >
              <div className="w-full flex justify-between pointer-events-auto">
                <button className="bg-blue-500 p-2 text-white rounded text-l" onClick={clickClose}>
                  Close
                </button>
                <button className="bg-blue-500 p-2 text-white rounded text-l" onClick={clickContinue}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

const EarthMesh = forwardRef<Mesh, EarthProps>(({ onPointerMove, onPointerUp }, ref) => {
  const base = import.meta.env.BASE_URL || "/";
  const texture = useLoader(TextureLoader, `${base}img/disk.png`);
  return (
    <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      ref={ref}>
      <circleGeometry args={[CIRCLE_RADIUS, 64]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
});

function EarthWireframe() {
  const wireframe = [];
  for (let amplitude = 0; amplitude < CIRCLE_RADIUS; amplitude += 10) {
    wireframe.push(<CircleWire amplitude={amplitude} key={amplitude} />);
  }
  return (
    <>
      {wireframe}
      <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}>
        <circleGeometry args={[CIRCLE_RADIUS, 32]} />
        <meshBasicMaterial color={"gray"} wireframe />
      </mesh>
    </>
  );
}

function CircleWire({ amplitude = CIRCLE_RADIUS, resolution = 90 }: { amplitude?: number, resolution?: number }) {
  const points = useMemo(() => {
    const size = 360 / resolution;
    return Array.from({ length: resolution + 1 }, (_, i) => {
      const segment = (i * size) * Math.PI / 180;
      return new Vector3(Math.cos(segment) * amplitude, 0, Math.sin(segment) * amplitude);
    });
  }, [amplitude, resolution]);
  return (
    <Line points={points} color={"grey"} linewidth={1} />
  );
}

const TextSprite = TextSpriteFactory({ fontsize: 30, scale: [20, 10, 1] });
const CityMesh = forwardRef<Mesh, CityProps>((props, meshRef) => {
  const radius = 1;
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} {...props} >
      <sphereGeometry args={[radius]} />
      <meshBasicMaterial color={"red"} />
    </mesh >);
})

