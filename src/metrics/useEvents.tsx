import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../state';

const TIMEOUT = 200;

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
    const token = 'token';// TODO: make api request 
    setJwt(token);
  }, [jwt, setJwt]);
}

function useStaticEvents() {
  const handleClick = useCallback((event: MouseEvent) => {
    console.log('clicked at', event.clientX, event.clientY);
  }, []);
  const handleSolver = useCallback(() => {
    console.log('used solver');
  }, []);

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

  const [path, setPath] = useState<{ x: number, y: number }[]>([]);
  const [cityName, setCityName] = useState<string>('');
  const handleAddPoint = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<PathEvent>;
    const x = customEvent.detail.mouseX;
    const y = customEvent.detail.mouseY;
    console.log('received drag: ', x, y);
    setPath((path) => [...path, { x, y }]);
  }, []);

  const handleStartDrag = useCallback((event: Event) => {
    console.log('starting drag');
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

    // TODO: send to db
    console.log('ending drag')
    console.log(path, cityName);
    setPath([]);
    setCityName('');
  }, [cityName, path]);

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
