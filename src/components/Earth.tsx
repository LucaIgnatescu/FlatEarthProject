import { ThreeEvent } from "@react-three/fiber";
import { Mesh } from "three";
import { useStore } from "../state";

export type EarthMesh = ({ dragCity, onPointerUp }:
  {
    dragCity: (event: ThreeEvent<PointerEvent>) => void,
    onPointerUp: (event?: ThreeEvent<PointerEvent>) => void
  }) => React.JSX.Element;


export function EarthWrapper({ EarthMesh }: { EarthMesh: EarthMesh }) { // TODO: Better wireframe
  const isDragging = useStore(state => state.isDragging);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const moveHoveredCity = useStore(state => state.moveHoveredCity);
  const updateIsDragging = useStore(state => state.updateIsDragging);
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

  const onPointerUp = () => {
    updateIsDragging(false)
  };

  return (
    <EarthMesh dragCity={dragCity} onPointerUp={onPointerUp} />
  );
}

