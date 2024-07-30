import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useLoader } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { Mesh, TextureLoader, } from "three";
import { SPHERE_RADIUS } from "../utils";
import { Stars } from "../components/shared";
import { Cities } from "../components/Cities";
import { Curves } from "../components/Curves";
import { useStore } from "../state";
import { UIWrapper } from "../ui";

export default function Globe() {
  const updateRoute = useStore(state => state.updateRoute);
  useLayoutEffect(() => {
    updateRoute('sphere');
  }
  );
  return (
    <>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <Controls />
        <Earth />
        <Stars />
        <Cities type="sphere" />
        <Curves type="sphere" />
      </Canvas>
      <UIWrapper />
    </>
  );
}


function Controls() {
  const isDragging = useStore(state => state.isDragging);
  // return <OrbitControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} />
  return <OrbitControls enabled={!isDragging} enablePan={false} enableDamping dampingFactor={0.075} minDistance={50} maxDistance={200} rotateSpeed={0.5} />
}

function Earth() { // TODO: Better wireframe
  const texture = useLoader(TextureLoader, '../../static/img/globe1.jpg');
  const isDragging = useStore(state => state.isDragging);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const moveHoveredCity = useStore(state => state.moveHoveredCity);
  const updateIsDragging = useStore(state => state.updateIsDragging);
  const ref = useRef<Mesh>(null!);

  const dragCity = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !hoveredCityRef.current) return;
    const meshes = event.intersections.filter((intersection) => intersection.object instanceof Mesh);
    if (meshes.length === 0) return;
    const earthIntersection = meshes[meshes.length - 1];
    if (earthIntersection === undefined) throw new Error("Didn't intersect earth");
    const { x, y, z } = earthIntersection.point;
    moveHoveredCity(x, y, z);
    event.stopPropagation();
  }
  return (
    <>
      <mesh onPointerUp={() => updateIsDragging(false)} onPointerMove={dragCity} ref={ref}>
        <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
        <meshBasicMaterial map={texture} />
      </mesh >
    </>
  );
}
