import { create } from 'zustand';
import { createRef, MutableRefObject } from 'react';
import { CityName, PolarCoords, positions } from './coordinates';
import { Mesh, Vector3 } from 'three';
import { Route } from './main';
import { ObjectType } from './utils';

export type Distances = {
  [key in CityName]?: {
    [key in CityName]?: number;
  }
}

export type CityTable = {
  [key in CityName]?: Mesh;
};

export type HoveredCityInfo = {
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

export type Store = {
  route: null | Route
  objectType: ObjectType
  citiesRef: MutableRefObject<CityTable>;
  hoveredCity: HoveredCityInfo | null;
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
  hoverPositions: { [key in CityName]?: { position: [number, number], rotation: number } };
  earthUUID: string | null;
  updateRoute: (route: Route) => void;
  updateCities: (name: CityName, city: Mesh, remove?: boolean) => void;
  updateHoveredCity: (name: CityName | null) => void;
  moveHoveredCity: (x: number, y: number, z: number, lock?: boolean) => void;
  updateIsDragging: (isDragging: boolean) => void;
  updateAnimationState: (status: AnimationType, cityName?: CityName) => boolean;
  updateContextMenu: (menu: ContextMenu) => void;
  updateIsPicking: (isPicking: boolean) => void;
  updateNCities: (nCities: number) => void;
  updateIsAnimating: (isAnimating: boolean) => void;
  updateControlsEnabled: (controlsEnabled: boolean) => void;
  updateMoveLock: (moveLock: boolean) => void;
  updateCurrPositions: () => void;
  updateHoverPositions: (cityName: CityName, position: [number, number] | null, rotation?: number) => void;
  updateEarthUUID: (uuid: string) => void;
}

const fillAnimationTable = (val: AnimationType) => Object.keys(positions).reduce((obj, key) => ({ ...obj, [key as CityName]: val }), {}) as Animations;



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

export const useStore = create<Store>((set, get) => ({
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
  updateContextMenu: (menu: ContextMenu) => set({ contextMenu: menu }),
  updateIsPicking: (isPicking: boolean) => set({ isPicking }),
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
  updateHoverPositions: (cityName: CityName, position: [number, number] | null, rotation: number = 0) => {
    set((state) => ({ hoverPositions: { ...state.hoverPositions, [cityName]: { position, rotation } } }))
  },
  updateEarthUUID: (earthUUID: string) => set({ earthUUID })
}));
