import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../state';
import { sendClick, sendDrag, sendHandshake } from './sendMetrics';

export function useEvents() {
  useDragEvents();
  useStaticEvents();
  useSetupEvent();
  useDragDispatcher();
}

export function useSetupEvent() {
  const setJwt = useStore(state => state.setJwt);
  const jwt = useStore(state => state.jwt);
  useEffect(() => {
    if (jwt !== null) {
      return;
    }

    sendHandshake().then(token => {
      if (token === null) {
        console.error("could not reach server");
        return;
      }
      setJwt(token);
    });
  }, [jwt, setJwt]);
}

function useStaticEvents() {
  const token = useStore(state => state.jwt);

  const handleClick = useCallback((event: MouseEvent) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    if (token === null) return;
    sendClick(token, mouseX, mouseY);
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

function useDragEvents() {
  const hoveredCity = useStore(state => state.hoveredCity);
  const token = useStore(state => state.jwt);
  const [path, setPath] = useState<{ x: number, y: number }[]>([]);
  const [cityName, setCityName] = useState<string>('');
  const handleAddPoint = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathEvent>;
    const x = customEvent.detail.mouseX;
    const y = customEvent.detail.mouseY;
    setPath((path) => [...path, { x, y }]);
  }, []);

  const handleStartDrag = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathEvent>;
    const x = customEvent.detail.mouseX;
    const y = customEvent.detail.mouseY;
    setPath([{ x, y }]);
    setCityName(hoveredCity?.name ?? '');
  }, [hoveredCity]);

  const handleStopDrag = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathEvent>;
    const x = customEvent.detail.mouseX;
    const y = customEvent.detail.mouseY;
    const finalPath = [...path, { x, y }];
    if (token !== null) {
      sendDrag(token, finalPath);
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

export type PathEvent = {
  mouseX: number;
  mouseY: number;
};

function useDragDispatcher() {
  const isDragging = useStore(state => state.isDragging);
  const mouseRef = useStore(state => state.mouseRef);
  const TIMEOUT = 200;

  useEffect(() => {
    if (isDragging === true) {
      const { mouseX, mouseY } = mouseRef.current;
      window.dispatchEvent(new CustomEvent('startDrag', {
        detail: { mouseX, mouseY }
      }));
    }

    const id = setInterval(() => {
      if (isDragging === true) {
        const { mouseX, mouseY } = mouseRef.current;
        const dragEvent = new CustomEvent<PathEvent>('addPoint', {
          detail: { mouseX, mouseY }
        });
        window.dispatchEvent(dragEvent);
      }
    }, TIMEOUT);

    return () => {
      if (isDragging === true) {
        const { mouseX, mouseY } = mouseRef.current;
        window.dispatchEvent(new CustomEvent('stopDrag', {
          detail: { mouseX, mouseY }
        }));
      }
      clearInterval(id);
    };
  }, [isDragging, mouseRef]);
}
