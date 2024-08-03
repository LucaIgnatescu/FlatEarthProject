import { create } from 'zustand';
import { createRef, MutableRefObject } from 'react';
import { CityName, PolarCoords, truePositions } from './coordinates';
import { Mesh } from 'three';
import { cartesianToPolar, EARTH_RADIUS, planarDistance, SCALE_FACTOR, SPHERE_RADIUS, sphericalDistance } from './utils';

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

export type AnimationStatus = 'fixed' | 'moving' | 'global' | null;

export type Animations = {
  [key in CityName]: AnimationStatus;
};

export type ContextMenu = {
  cityName: CityName | null;
  mousePosition: [number, number] | null;
  anchor: CityName | null;
  visible: boolean
};

export type Positions = { [key in CityName]?: PolarCoords };

export type Store = {
  route: null | 'plane' | 'sphere'
  citiesRef: MutableRefObject<CityTable>;
  hoveredCityRef: MutableRefObject<HoveredCityInfo | null>;
  isDragging: boolean;
  currDistances: Distances;
  animations: Animations;
  contextMenu: ContextMenu;
  isPicking: boolean;
  nCities: number;
  updateRoute: (route: 'plane' | 'sphere') => void;
  updateCurrDistances: () => void;
  updateCities: (name: CityName, city: Mesh) => void;
  updateHoveredCity: (name: CityName | null) => void;
  moveHoveredCity: (x: number, y: number, z: number) => void;
  updateIsDragging: (isDragging: boolean) => void;
  updateAnimationState: (status: AnimationStatus, cityName?: CityName) => void;
  updateContextMenu: (menu: ContextMenu) => void;
  updateIsPicking: (isPicking: boolean) => void;
  updateNCities: (nCities: number) => void;
  getTruePositions: () => Positions;
}

const fillAnimationTable = (val: AnimationStatus) => Object.keys(truePositions).reduce((obj, key) => ({ ...obj, [key as CityName]: val }), {}) as Animations;


const calculateDistancesPlane = (cities: CityTable) => {
  const currDistaces: Distances = {};
  for (const [cityName1, cityMesh1] of Object.entries(cities) as [CityName, Mesh][]) {
    for (const [cityName2, cityMesh2] of Object.entries(cities) as [CityName, Mesh][]) {
      const distance = planarDistance(cityMesh1, cityMesh2) * SCALE_FACTOR;
      if (currDistaces[cityName1] === undefined) currDistaces[cityName1] = {};
      if (currDistaces[cityName2] === undefined) currDistaces[cityName2] = {};
      currDistaces[cityName1][cityName2] = distance;
      currDistaces[cityName2][cityName1] = distance;
    }
  }
  return currDistaces;
}


const calculateDistancesSphere = (cities: CityTable) => { // FIX:
  const currDistaces: Distances = {};
  for (const [cityName1, cityMesh1] of Object.entries(cities) as [CityName, Mesh][]) {
    for (const [cityName2, cityMesh2] of Object.entries(cities) as [CityName, Mesh][]) {
      const p1 = cartesianToPolar(cityMesh1.position, SPHERE_RADIUS);
      const p2 = cartesianToPolar(cityMesh2.position, SPHERE_RADIUS);
      const distance = sphericalDistance(p1, p2, EARTH_RADIUS); //compute distances as if on the earth
      if (currDistaces[cityName1] === undefined) currDistaces[cityName1] = {};
      if (currDistaces[cityName2] === undefined) currDistaces[cityName2] = {};
      currDistaces[cityName1][cityName2] = distance;
      currDistaces[cityName2][cityName1] = distance;
    }
  }
  return currDistaces;
}

const currDistances = {};
const isDragging = false;
const citiesRef = createRef() as MutableRefObject<CityTable>;
const hoveredCityRef = createRef() as MutableRefObject<HoveredCityInfo | null>;
const animations = fillAnimationTable(null);
const contextMenu: ContextMenu = { cityName: null, anchor: null, mousePosition: null, visible: false };
const isPicking = false;
const nCities = 8;
citiesRef.current = {};
export const useStore = create<Store>((set, get) => ({
  route: null,
  citiesRef,
  hoveredCityRef,
  isDragging,
  currDistances,
  animations,
  contextMenu,
  isPicking,
  nCities,
  updateRoute: (route: 'plane' | 'sphere') => {
    get().citiesRef.current = {};
    get().hoveredCityRef.current = null;
    get().updateIsDragging(false);
    get().updateAnimationState(null);
    const calculateDistances = (route === 'plane') ? calculateDistancesPlane : calculateDistancesSphere;
    const updateCurrDistances = () => {
      const cities = get().citiesRef.current;
      if (!cities) return;
      set({ currDistances: calculateDistances(cities) });
    }
    set({ updateCurrDistances, route });
  },
  updateCurrDistances: () => { throw new Error('route not set properly') },
  updateCities: (name: CityName, city: Mesh) => {
    get().citiesRef.current[name] = city;
    get().updateCurrDistances();
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

  moveHoveredCity: (x: number, y: number, z: number) => {
    const hoveredCity = get().hoveredCityRef.current
    if (hoveredCity === null)
      throw new Error("Trying to move without selecting a city");
    hoveredCity.mesh.position.set(x, y, z);
    get().updateCurrDistances();
  },
  updateIsDragging: (isDragging: boolean) => set({ isDragging }),
  updateAnimationState: (status: AnimationStatus, cityName?: CityName) => {
    if (cityName === undefined) {
      return set({ animations: fillAnimationTable(status) });
    } else if (status === 'fixed') {
      const animations = fillAnimationTable('moving');
      animations[cityName] = 'fixed';
      set({ animations });
    } else {
      return set((state) =>
        ({ animations: { ...state.animations, [cityName]: status } }));
    }
  },
  updateContextMenu: (menu: ContextMenu) => set({ contextMenu: menu }),
  updateIsPicking: (isPicking: boolean) => set({ isPicking }),
  updateNCities: (nCities: number) => set({ nCities }),
  getTruePositions: () => {
    const n = get().nCities;
    if (n === undefined) return truePositions;
    const keys = Object.keys(truePositions) as CityName[];
    const ans: { [key in CityName]?: PolarCoords } = {};
    for (let i = 0; i < n; i++) {
      const key = keys[i];
      ans[key] = truePositions[key];
    }
    return ans;
  }
}));
