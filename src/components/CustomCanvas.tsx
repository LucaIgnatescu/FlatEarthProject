import { Canvas } from "@react-three/fiber";
import { useCanvasEvents } from "../metrics/useEvents";


function SetupEvents() {
  useCanvasEvents();
  return null;
}

export default function CustomCanvas({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <Canvas onClick={ev => ev.stopPropagation()} className={className}>
      <SetupEvents />
      {children}
    </Canvas>
  );
}
