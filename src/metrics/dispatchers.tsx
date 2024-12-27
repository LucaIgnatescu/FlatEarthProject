import { useEffect } from 'react';
import { useStore } from '../state';
import { useThree } from '@react-three/fiber';

export type PathPoint = {
  x: number;
  y: number;
  z: number;
};

export function useDragDispatcher() {
  const isDragging = useStore(state => state.isDragging);
  const mouseRef = useStore(state => state.mouseRef);
  const pointer = useThree(state => state.pointer);
  const camera = useThree(state => state.camera);
  const raycaster = useThree(state => state.raycaster);
  const scene = useThree(state => state.scene);
  const earthUUID = useStore(state => state.earthUUID);

  const TIMEOUT = 200;

  useEffect(() => {
    function computeIntersection() {
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(scene.children);
      const earthIntersection = intersections.find(
        (intersection) => intersection.object.uuid === earthUUID
      );
      if (earthIntersection === undefined) return null
      let { x, y, z } = earthIntersection.point;
      x = +x.toFixed(3);
      y = +y.toFixed(3);
      z = +z.toFixed(3);
      return { x, y, z };
    }
    if (isDragging === true) {
      const intersection = computeIntersection();
      if (intersection === null) return;
      window.dispatchEvent(new CustomEvent<PathPoint>('startDrag', {
        detail: { ...intersection }
      }));
    }

    const id = setInterval(() => {
      if (isDragging === true) {
        const intersection = computeIntersection();
        if (intersection === null) return;
        const dragEvent = new CustomEvent<PathPoint>('addPoint', {
          detail: { ...intersection }
        });
        window.dispatchEvent(dragEvent);
      }
    }, TIMEOUT);

    return () => {
      if (isDragging === true) {
        const intersection = computeIntersection();
        if (intersection === null) return;
        window.dispatchEvent(new CustomEvent('stopDrag', {
          detail: { ...intersection }
        }));
      }
      clearInterval(id);
    };
  }, [isDragging, mouseRef, camera, scene, pointer, earthUUID, raycaster]);
}


