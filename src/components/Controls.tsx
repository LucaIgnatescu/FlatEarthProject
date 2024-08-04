import { MapControls, OrbitControls } from "@react-three/drei";
import { useStore } from "../state";
import { ObjectType } from "../utils";

export function Controls({ type }: { type: ObjectType }) {
  const isDragging = useStore(state => state.isDragging);
  return (type == 'sphere' ?
    <OrbitControls enabled={!isDragging} enablePan={false} enableDamping dampingFactor={0.075} minDistance={50} maxDistance={200} rotateSpeed={0.5} /> :
    <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} />
  )
}
