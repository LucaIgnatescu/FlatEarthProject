import { useEffect } from 'react';
import { useStore } from '../state';
import { useRegisterDragHandlers, useRegisterUIHandlers } from './handlers';
import { useDragDispatcher } from './dispatchers';
import { postHandshake } from './postMetrics';
import { useNavigate } from 'react-router-dom';

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
      console.log("jwt already set");
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


export function useProgressionTracker() {
  const route = useStore(state => state.route);
  const jwt = useStore(state => state.jwt);
  const updateProgression = useStore(state => state.updateProgression);
  const navigate = useNavigate();
  console.log(route);
  useEffect(() => {
    if (route === null) {
      return;
    }
    const ok = updateProgression(route);
    console.log(ok);
    if (ok === false) {
      if (window.history.length === 1) {
        return navigate('/');
      }
      navigate(-1);
    }
  }, [jwt, route, updateProgression, navigate]);
}
