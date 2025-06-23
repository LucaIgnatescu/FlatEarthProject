import { create } from 'zustand';
import { createRef, MutableRefObject } from 'react';
import { PolarCoords, positions, CityName } from './coordinates';
import { Mesh, Vector3 } from 'three';
import { Route } from './App';
import { ObjectType } from './utils';
import Cookies from 'js-cookie';
import { postRouteChange } from './metrics/postMetrics';

export type Distances = {
  [key in CityName]?: {
    [key in CityName]?: number;
  }
}

export type CityTable = {
  [key in CityName]?: Mesh;
};

export type CityInfo = {
  name: CityName;
  mesh: Mesh;
}

export type AnimationType = 'fixed' | 'moving' | 'global' | null;

export type Animations = {
  [key in CityName]: AnimationType;
};

export type ContextMenu = {
  cityName: CityName | null;
  mousePosition: [number, number] | null;
  anchor: CityName | null;
  visible: boolean
};


export type Positions = { [key in CityName]?: PolarCoords };
export type CurrPositions = { [key in CityName]?: Vector3 };
export type CityPair = `${CityName}_${CityName}`;

export type MainStore = {
  route: null | Route
  objectType: ObjectType
  citiesRef: MutableRefObject<CityTable>;
  hoveredCity: CityInfo | null;
  isDragging: boolean;
  animations: Animations;
  contextMenu: ContextMenu;
  nCities: number;
  isAnimating: boolean;
  truePositions: Positions;
  nRenderedCities: number;
  controlsEnabled: boolean;
  moveLock: boolean;
  currPositions: CurrPositions;
  hoverPositions: { [key in CityPair]?: { position: [number, number] | null, rotation: number } };
  earthUUID: string | null;
  progression: Route | null;
  mouseRef: MutableRefObject<{ mouseX: number, mouseY: number }>
  jwt: string | null;
  completed: boolean;
  updateRoute: (route: Route) => void;
  updateCities: (name: CityName, city: Mesh, remove?: boolean) => void;
  updateHoveredCity: (name: CityName | null) => void;
  moveHoveredCity: (x: number, y: number, z: number, lock?: boolean) => void;
  updateIsDragging: (isDragging: boolean) => void;
  updateAnimationState: (status: AnimationType, cityName?: CityName) => boolean;
  updateContextMenu: (menu: ContextMenu) => void;
  updateNCities: (nCities: number) => void;
  updateIsAnimating: (isAnimating: boolean) => void;
  updateControlsEnabled: (controlsEnabled: boolean) => void;
  updateMoveLock: (moveLock: boolean) => void;
  updateCurrPositions: () => void;
  updateHoverPositions: (key: CityPair, position: [number, number] | null, rotation?: number) => void;
  clearHoverPositions: () => void;
  updateEarthUUID: (uuid: string) => void;
  updateProgression: (route: Route) => boolean;
  updateMousePosition: (x: number, y: number) => void;
  setJwt: (jwt: string) => void;
  updateCompleted: (completed: boolean) => void;
}


const fillAnimationTable = (val: AnimationType) => Object.keys(positions).reduce((obj, key) => ({ ...obj, [key as CityName]: val }), {}) as Animations;



const isDragging = false;
const citiesRef = createRef() as MutableRefObject<CityTable>;
const hoveredCity = null;
const animations = fillAnimationTable(null);
const contextMenu: ContextMenu = { cityName: null, anchor: null, mousePosition: null, visible: false };
const isAnimating = false;
const nCities = 7;
const route = null;
const truePositions = {};
const nRenderedCities = 0;
const controls = true;
const moveLock = false;
const objectType: ObjectType = 'plane';
const currPositions = {};
const hoverPositions = {};
const earthUUID = null;
const progression = Cookies.get('progression') as Route ?? null;
const completed = false;
citiesRef.current = {};



const mouseX = 0;
const mouseY = 0;
const mouseRef = createRef() as MutableRefObject<{ mouseX: number, mouseY: number }>;
mouseRef.current = { mouseX, mouseY };
const jwt = Cookies.get('jwt') || null;

export const useStore = create<MainStore>((set, get) => (
  {
    route,
    citiesRef,
    hoveredCity,
    isDragging,
    animations,
    contextMenu,
    nCities,
    isAnimating,
    nRenderedCities,
    truePositions: truePositions,
    controlsEnabled: controls,
    moveLock: moveLock,
    objectType,
    currPositions,
    hoverPositions,
    earthUUID,
    progression,
    jwt,
    mouseRef,
    completed,
    updateMoveLock: (moveLock: boolean) => set({ moveLock }),
    updateRoute: (route: Route) => {
      get().hoveredCity = null;
      get().updateIsDragging(isDragging);
      get().updateAnimationState(null);
      get().citiesRef.current = {};

      let objectType: ObjectType = route === 'globe' ? 'sphere' : 'plane';

      set({ route, nRenderedCities, isAnimating, isDragging, contextMenu, nCities, truePositions, objectType, earthUUID, hoverPositions });
    },
    updateCities: (name: CityName, city: Mesh, remove: boolean = false) => {
      const cities = get().citiesRef.current;
      if (remove === true) {
        if (cities[name] === undefined) return;
        get().citiesRef.current[name];
        set(state => ({ nRenderedCities: state.nRenderedCities - 1 }))
      } else {
        get().citiesRef.current[name] = city;
        set(state => ({ nRenderedCities: state.nRenderedCities + 1 }))
      }
      get().updateCurrPositions();
    },
    updateHoveredCity: (name: CityName | null) => {
      if (name === null) {
        set({ hoveredCity: null });
        return;
      }
      const mesh = get().citiesRef.current[name];
      if (mesh === undefined) throw new Error("invalid city name");
      set({ hoveredCity: { name, mesh } });
    },
    moveHoveredCity: (x: number, y: number, z: number, lock?: boolean) => {
      if (get().moveLock === true && lock !== false) return;
      const hoveredCity = get().hoveredCity;
      if (hoveredCity === null)
        throw new Error("Trying to move without selecting a city");
      hoveredCity.mesh.position.set(x, y, z);
      if (lock !== undefined) {
        set({ moveLock: lock })
      }
      get().updateCurrPositions();
    },
    updateIsDragging: (isDragging: boolean) => set({ isDragging }),
    updateAnimationState: (status: AnimationType, cityName?: CityName) => {
      if (status !== null && Object.values(get().animations).find(animation => animation === null) === undefined)
        return false;
      if (cityName === undefined) {
        set({ animations: fillAnimationTable(status) });
        return true;
      }
      if (status === 'fixed') {
        const animations = fillAnimationTable('moving');
        animations[cityName] = null;
        set({ animations });
        return true;
      }
      set((state) => ({ animations: { ...state.animations, [cityName]: status } }));
      return true;
    },
    updateContextMenu: (contextMenu: ContextMenu) => set({ contextMenu }),
    updateNCities: (nCities: number) => {
      const n = nCities;
      if (n === undefined) return positions;
      const keys = Object.keys(positions) as CityName[];
      const truePositions: { [key in CityName]?: PolarCoords } = {};
      for (let i = 0; i < n; i++) {
        const key = keys[i];
        truePositions[key] = positions[key];
      }
      set({ hoveredCity: null }); n
      get().updateIsDragging(isDragging);
      get().updateAnimationState(null);
      set({ nCities, isAnimating, isDragging, contextMenu, truePositions, hoverPositions })
    },
    updateIsAnimating: (isAnimating: boolean) => set({ isAnimating }),
    updateControlsEnabled: (controlsEnabled: boolean) => set({ controlsEnabled }),
    updateCurrPositions: () => {
      const currPositions: CurrPositions = {};
      const cities = get().citiesRef.current;
      for (const cityName of Object.keys(cities) as CityName[]) {
        currPositions[cityName] = citiesRef.current[cityName]?.position;
      }
      set({ currPositions })
    },
    updateHoverPositions: (key: CityPair, position: [number, number] | null, rotation: number = 0) => {
      set((state) => ({ hoverPositions: { ...state.hoverPositions, [key]: { position, rotation } } }))
    },
    clearHoverPositions: () => {
      set({ hoverPositions: {} })
    },
    updateEarthUUID: (earthUUID: string) => set({ earthUUID }),
    updateProgression: (route: Route) => {
      const sequence = [
        null,
        'tutorial1',
        'tutorial2',
        'tutorial3',
        'tutorial4',
        'tutorial5',
        'plane',
        'globe',
        'planepost'
      ];

      if (!sequence.includes(route)) {
        postRouteChange(get().jwt, route);
        return true;
      }

      const currProgression = get().progression as Route;
      const currIndex = sequence.indexOf(currProgression);
      const nextIndex = sequence.indexOf(route);

      if (currIndex === null) {
        throw Error("currIndex should never be null");
      }

      if (nextIndex > currIndex + 1) {
        postRouteChange(get().jwt, route, false);
        return false;
      }

      if (nextIndex === currIndex + 1) {
        set({ progression: route });
        Cookies.set('progression', route, { expires: 1 / 24 });
        postRouteChange(get().jwt, route);
        return true;
      }
      postRouteChange(get().jwt, route);
      return true;
    },
    updateMousePosition:
      (mouseX: number, mouseY: number) => get().mouseRef.current = { mouseX, mouseY },
    setJwt: (jwt: string) => {
      Cookies.set('jwt', jwt, { expires: 1 / 24 }); // NOTE: 1h seems reasonable
      set({ jwt });
    },
    updateCompleted: (completed: boolean) => set({ completed })
  }
));

