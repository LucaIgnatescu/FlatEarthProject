import { create } from 'zustand';
import { createRef, MutableRefObject } from 'react';
import { CityName, PolarCoords, positions } from './coordinates';
import { Mesh } from 'three';
import { Route } from './main';
import { ObjectType } from './utils';
import { computeTotalError } from './distances';

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


export type Store = {
  route: null | Route
  objectType: ObjectType
  citiesRef: MutableRefObject<CityTable>;
  hoveredCityRef: MutableRefObject<HoveredCityInfo | null>;
  isDragging: boolean;
  currDistances: Distances;
  animations: Animations;
  contextMenu: ContextMenu;
  isPicking: boolean;
  nCities: number;
  isAnimating: boolean;
  truePositions: Positions;
  nRenderedCities: number;
  controlsEnabled: boolean;
  moveLock: boolean;
  totalError: number;
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
  updateTotalError: () => void;
}

const fillAnimationTable = (val: AnimationType) => Object.keys(positions).reduce((obj, key) => ({ ...obj, [key as CityName]: val }), {}) as Animations;



const currDistances = {};
const isDragging = false;
const citiesRef = createRef() as MutableRefObject<CityTable>;
const hoveredCityRef = createRef() as MutableRefObject<HoveredCityInfo | null>;
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
const totalError = 0;
citiesRef.current = {};

export const useStore = create<Store>((set, get) => ({
  route,
  citiesRef,
  hoveredCityRef,
  isDragging,
  currDistances,
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
  totalError,
  updateMoveLock: (moveLock: boolean) => set({ moveLock }),
  updateRoute: (route: Route) => {
    get().hoveredCityRef.current = null;
    get().updateIsDragging(isDragging);
    get().updateAnimationState(null);
    get().citiesRef.current = {};

    const objectType: ObjectType = route === 'sphere' ? 'sphere' : 'plane';
    set({ route, nRenderedCities, isAnimating, isDragging, contextMenu, nCities, truePositions, objectType });
  },
  updateCities: (name: CityName, city: Mesh, remove: boolean = false) => {
    const cities = get().citiesRef.current;
    if (remove === true) {
      if (cities[name] === undefined) return;
      delete cities[name];
      set(state => ({ nRenderedCities: state.nRenderedCities - 1 }))
    } else {
      cities[name] = city;
      set(state => ({ nRenderedCities: state.nRenderedCities + 1 }))
    }
    get().updateTotalError();
  },
  updateHoveredCity: (name: CityName | null) => {
    if (name === null) {
      get().hoveredCityRef.current = null;
      return;
    }
    const mesh = get().citiesRef.current[name];
    if (mesh === undefined) throw new Error("invalid city name");
    get().hoveredCityRef.current = { name, mesh };
  },

  moveHoveredCity: (x: number, y: number, z: number, lock?: boolean) => {
    if (get().moveLock === true && lock !== false) return;
    const hoveredCity = get().hoveredCityRef.current;
    if (hoveredCity === null)
      throw new Error("Trying to move without selecting a city");
    hoveredCity.mesh.position.set(x, y, z);
    if (lock !== undefined) {
      set({ moveLock: lock })
    }
    get().updateTotalError();
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
      animations[cityName] = 'fixed';
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
    get().hoveredCityRef.current = null;
    get().updateIsDragging(isDragging);
    get().updateAnimationState(null);
    set({ nCities, isAnimating, isDragging, contextMenu, route, truePositions })
  },
  updateIsAnimating: (isAnimating: boolean) => set({ isAnimating }),
  updateControlsEnabled: (controlsEnabled: boolean) => set({ controlsEnabled }),
  updateTotalError: () => {
    const totalError = computeTotalError(get().objectType, get().citiesRef);
    set({ totalError });
  }
}));
