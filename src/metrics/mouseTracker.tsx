import { useEffect } from "react";
import { useStore } from "../state";

export function useMouseTracker() {
  const updateMousePosition = useStore(state => state.updateMousePosition);

  useEffect(() => {
    const moveHandler = (event: MouseEvent) => {
      updateMousePosition(event.clientX, event.clientY);
    };
    window.addEventListener('mousemove', moveHandler);
    return () => window.removeEventListener('mousemove', moveHandler);
  }, [updateMousePosition]);
}
