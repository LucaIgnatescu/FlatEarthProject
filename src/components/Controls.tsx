import { MapControls, OrbitControls } from "@react-three/drei";
import { useStore } from "../state";
import { ObjectType } from "../utils";

export function Controls({ type }: { type: ObjectType }) {
  const controlsEnabled = useStore(state => state.controlsEnabled);
  return (type == 'sphere' ?
    <OrbitControls enabled={controlsEnabled} enablePan={false} enableDamping dampingFactor={0.075} minDistance={50} maxDistance={200} rotateSpeed={0.5} /> :
    <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={controlsEnabled} />
  )
}
