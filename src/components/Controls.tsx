import { MapControls, OrbitControls } from "@react-three/drei";
import { useStore } from "../state";

export function Controls() {
  const controlsEnabled = useStore(state => state.controlsEnabled);
  const type = useStore(state => state.objectType);
  return (type == 'sphere' ?
    <OrbitControls enabled={controlsEnabled} enablePan={false} enableDamping dampingFactor={0.075} minDistance={50} maxDistance={200} rotateSpeed={0.5} /> :
    <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={controlsEnabled} />
  )
}
