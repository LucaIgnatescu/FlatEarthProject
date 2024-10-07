import { create } from 'zustand';
import { createRef, MutableRefObject } from 'react';
import { PolarCoords, positions, CityName } from './coordinates';
import { Mesh, Vector3 } from 'three';
import { Route } from './App';
import { ObjectType } from './utils';

export type Distances = {
  [key in string]?: {
    [key in string]?: number;
  }
}

export type CityTable = {
  [key in string]?: Mesh;
};

export type CityInfo = {
  name: CityName;
  mesh: Mesh;
}

export type AnimationType = 'fixed' | 'moving' | 'global' | null;

export type Animations = {
  [key in string]: AnimationType;
};

export type ContextMenu = {
  cityName: string | null;
  mousePosition: [number, number] | null;
  anchor: string | null;
  visible: boolean
};

export type Positions = { [key in string]?: PolarCoords };
export type CurrPositions = { [key in string]?: Vector3 };
export type CityPair = `${CityName}_${CityName}`;
export type MainSlice = {
  route: null | Route
  objectType: ObjectType
  citiesRef: MutableRefObject<CityTable>;
  hoveredCity: CityInfo | null;
  isDragging: boolean;
  animations: Animations;
  contextMenu: ContextMenu;
  isPicking: boolean;
  nCities: number;
  isAnimating: boolean;
  truePositions: Positions;
  nRenderedCities: number;
  controlsEnabled: boolean;
  moveLock: boolean;
  currPositions: CurrPositions;
  hoverPositions: { [key in CityPair]?: { position: [number, number] | null, rotation: number } };
  earthUUID: string | null;
  updateRoute: (route: Route) => void;
  updateCities: (name: string, city: Mesh, remove?: boolean) => void;
  updateHoveredCity: (name: string | null) => void;
  moveHoveredCity: (x: number, y: number, z: number, lock?: boolean) => void;
  updateIsDragging: (isDragging: boolean) => void;
  updateAnimationState: (status: AnimationType, cityName?: string) => boolean;
  updateContextMenu: (menu: ContextMenu) => void;
  updateIsPicking: (isPicking: boolean) => void;
  updateNCities: (nCities: number) => void;
  updateIsAnimating: (isAnimating: boolean) => void;
  updateControlsEnabled: (controlsEnabled: boolean) => void;
  updateMoveLock: (moveLock: boolean) => void;
  updateCurrPositions: () => void;
  updateHoverPositions: (key: CityPair, position: [number, number] | null, rotation?: number) => void;
  clearHoverPositions: () => void;
  updateEarthUUID: (uuid: string) => void;
}

export type MetricsSlice = {
  mouseRef: MutableRefObject<{ mouseX: number, mouseY: number }>
  jwt: string | null;
  updateMousePosition: (x: number, y: number) => void;
  setJwt: (jwt: string) => void;
}

const fillAnimationTable = (val: AnimationType) => Object.keys(positions).reduce((obj, key) => ({ ...obj, [key as string]: val }), {}) as Animations;



const isDragging = false;
const citiesRef = createRef() as MutableRefObject<CityTable>;
const hoveredCity = null;
const animations = fillAnimationTable(null);
const contextMenu: ContextMenu = { cityName: null, anchor: null, mousePosition: null, visible: false };
const isPicking = false;
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
citiesRef.current = {};

//export const useStore = create<MainSlice>((set, get) => ({
//@ts-expect-error: "Zustand types"
const createMainSlice = (set, get) => ({
  route,
  citiesRef,
  hoveredCity,
  isDragging,
  animations,
  contextMenu,
  isPicking,
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
  updateMoveLock: (moveLock: boolean) => set({ moveLock }),
  updateRoute: (route: Route) => {
    get().hoveredCity = null;
    get().updateIsDragging(isDragging);
    get().updateAnimationState(null);
    get().citiesRef.current = {};

    const objectType: ObjectType = route === 'sphere' ? 'sphere' : 'plane';
    set({ route, nRenderedCities, isAnimating, isDragging, contextMenu, nCities, truePositions, objectType, earthUUID, hoverPositions });
  },
  updateCities: (name: string, city: Mesh, remove: boolean = false) => {
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
  updateHoveredCity: (name: string | null) => {
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
  updateAnimationState: (status: AnimationType, cityName?: string) => {
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
  updateContextMenu: (menu: ContextMenu) => set({ contextMenu: menu }),
  updateIsPicking: (isPicking: boolean) => set({ isPicking }),
  updateNCities: (nCities: number) => {
    const n = nCities;
    if (n === undefined) return positions;
    const keys = Object.keys(positions) as string[];
    const truePositions: { [key in string]?: PolarCoords } = {};
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
    for (const cityName of Object.keys(cities) as string[]) {
      currPositions[cityName] = citiesRef.current[cityName]?.position;
    }
    set({ currPositions })
  },
  updateHoverPositions: (key: string, position: [number, number] | null, rotation: number = 0) => {
    set((state) => ({ hoverPositions: { ...state.hoverPositions, [key]: { position, rotation } } }))
  },
  clearHoverPositions: () => {
    set({ hoverPositions: {} })
  },
  updateEarthUUID: (earthUUID: string) => set({ earthUUID })
});


const mouseX = 0;
const mouseY = 0;
const mouseRef = createRef() as MutableRefObject<{ mouseX: number, mouseY: number }>;
mouseRef.current = { mouseX, mouseY };
const jwt = null;

//@ts-expect-error: not very ts friendly
const createMetricsSlice = (set, get) => ({
  jwt,
  mouseRef,
  updateMousePosition:
    (mouseX: number, mouseY: number) => get().mouseRef.current = { mouseX, mouseY },
  setJwt: (jwt: string) => set({ jwt })
});

export const useStore = create<MainSlice & MetricsSlice>((...a) => ({
  //@ts-expect-error: not very ts friendly
  ...createMainSlice(...a),
  //@ts-expect-error: not very ts friendly
  ...createMetricsSlice(...a)
}));

// TODO: Fix Typescript Errors
