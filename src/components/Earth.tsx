import { ThreeEvent } from "@react-three/fiber";
import { Mesh } from "three";
import { useStore } from "../state";
import { TutorialEarthMesh } from "./TutorialDefaults";
import { useRef } from "react";


export type EarthProps = {
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void,
  onPointerUp: (event?: ThreeEvent<PointerEvent>) => void
}
export function EarthWrapper({ EarthMesh }: { EarthMesh: typeof TutorialEarthMesh }) { // TODO: Better wireframe
  const isDragging = useStore(state => state.isDragging);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const moveHoveredCity = useStore(state => state.moveHoveredCity);
  const updateIsDragging = useStore(state => state.updateIsDragging);
  const updateControls = useStore(state => state.updateControlsEnabled);
  const meshRef = useRef<Mesh>(null!);

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !hoveredCityRef.current) return;
    const earthIntersection = event.intersections.find((intersection) => intersection.object.uuid === meshRef.current.uuid);
    if (earthIntersection === undefined) throw new Error("Didn't intersect earth");
    const { x, y, z } = earthIntersection.point;
    moveHoveredCity(x, y, z);
    event.stopPropagation();
  }

  const onPointerUp = () => {
    updateIsDragging(false)
    updateControls(true)
  };

  return (
    <EarthMesh onPointerMove={onPointerMove} onPointerUp={onPointerUp} ref={meshRef} />
  );
}

