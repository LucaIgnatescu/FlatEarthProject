import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../state';
import { postClick, postDrag } from './postMetrics';
import { PathPoint } from './dispatchers';

export function useRegisterUIHandlers() {
  const token = useStore(state => state.jwt);
  const handleClick = useCallback((event: MouseEvent) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    if (token === null) return;
    postClick(token, mouseX, mouseY);
  }, [token]);

  const handleSolver = useCallback(() => {
    if (token === null) return;
  }, [token]);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    window.addEventListener('solver', handleSolver);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('solver', handleSolver);
    };
  });
}

export function useRegisterDragHandlers() {
  const hoveredCity = useStore(state => state.hoveredCity);
  const token = useStore(state => state.jwt);
  const [path, setPath] = useState<PathPoint[]>([]);
  const [, setCityName] = useState<string>('');

  const handleAddPoint = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathPoint>;
    setPath((path) => [...path, { ...customEvent.detail }]);
  }, []);

  const handleStartDrag = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathPoint>;
    setPath([{ ...customEvent.detail }]);
    setCityName(hoveredCity?.name ?? '');
  }, [hoveredCity]);

  const handleStopDrag = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathPoint>;
    const finalPath = [...path, { ...customEvent.detail }];
    if (token !== null) {
      postDrag(token, finalPath);
    }
    setPath([]);
    setCityName('');
  }, [path, token]);

  useEffect(() => {
    window.addEventListener('startDrag', handleStartDrag);
    window.addEventListener('stopDrag', handleStopDrag);
    window.addEventListener('addPoint', handleAddPoint);
    return () => {
      window.removeEventListener('startDrag', handleStartDrag);
      window.removeEventListener('stopDrag', handleStopDrag);
      window.removeEventListener('addPoint', handleAddPoint);
    }
  }, [handleStartDrag, handleAddPoint, handleStopDrag]);
}
