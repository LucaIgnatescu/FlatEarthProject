import { useEffect } from 'react';
import { useStore } from '../state';
import { useRegisterDragHandlers, useRegisterUIHandlers } from './handlers';
import { useDragDispatcher } from './dispatchers';


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

    //postHandshake().then(token => {
    //  if (token === null) {
    //    console.error("could not reach server");
    //    return;
    //  }
    //  setJwt(token);
    //});
  }, [jwt, setJwt]);
}

