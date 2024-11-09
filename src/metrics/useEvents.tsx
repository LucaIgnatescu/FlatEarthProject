import { useEffect, useState } from 'react';
import { useStore } from '../state';
import { useRegisterDragHandlers, useRegisterUIHandlers } from './handlers';
import { useDragDispatcher } from './dispatchers';
import { postHandshake, postRouteChange } from './postMetrics';
import { Route } from '../App';


export function useGlobalEvents() {
  useHandshake();
  useRegisterUIHandlers();
}

export function useCanvasEvents() {
  useRegisterDragHandlers();
  useDragDispatcher();
}


export function useHandshake() {
  const setJwt = useStore(state => state.setJwt);
  const jwt = useStore(state => state.jwt);
  useEffect(() => {
    if (jwt !== null) {
      return;
    }
    postHandshake().then(token => {
      if (token === null) {
        console.error("could not reach server");
        return;
      }
      setJwt(token);
    });
  }, [jwt, setJwt]);
}


export function useRouteTracker() {
  const route = useStore(state => state.route);
  const [seen, setSeen] = useState<Route[]>([]);
  const jwt = useStore(state => state.jwt);
  useEffect(() => {
    if (route === null || seen.includes(route) || jwt === null) {
      return;
    }
    postRouteChange(jwt, route);
    setSeen([...seen, route]);
    console.log("updating and sending route", route);
  }, [seen, jwt, route]);
}
