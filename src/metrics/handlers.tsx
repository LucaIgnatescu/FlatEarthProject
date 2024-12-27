import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../state';
import { postClick, postDrag, postExit } from './postMetrics';
import { PathPoint } from './dispatchers';

export function useRegisterUIHandlers() {
  const token = useStore(state => state.jwt);
  const route = useStore(state => state.route);
  const handleClick = useCallback((event: MouseEvent) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    if (token === null) return;
    postClick(token, mouseX, mouseY);
  }, [token]);

  const handleSolver = useCallback(() => {
    if (token === null) return;
  }, [token]);

  const handleExit = async () => {
    await postExit(token, route);
  }

  useEffect(() => {
    window.addEventListener('click', handleClick);
    window.addEventListener('solver', handleSolver);
    window.addEventListener('beforeunload', handleExit);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('solver', handleSolver);
      window.removeEventListener('beforeunload', handleExit);
    };
  });
}

export function useRegisterDragHandlers() {
  const hoveredCity = useStore(state => state.hoveredCity);
  const token = useStore(state => state.jwt);
  const [path, setPath] = useState<PathPoint[]>([]);
  //const [, setCityName] = useState<CityName | null>(null);

  const handleAddPoint = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathPoint>;
    setPath((path) => [...path, { ...customEvent.detail }]);
  }, []);

  const handleStartDrag = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathPoint>;
    setPath([{ ...customEvent.detail }]);
    //setCityName(hoveredCity?.name ?? '');
  }, []);

  const handleStopDrag = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathPoint>;
    const finalPath = [...path, { ...customEvent.detail }];
    if (token !== null && hoveredCity !== null) {
      postDrag(token, finalPath, hoveredCity.name);
    }
    setPath([]);
    //setCityName('');
  }, [path, token, hoveredCity]);

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
