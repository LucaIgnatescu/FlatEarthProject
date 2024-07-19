import { createContext, memo, MutableRefObject, useCallback, useContext, useRef, useState } from "react";
import { Mesh } from "three";
import { CityName, CityRealCoords } from "./coordinates";
import { PlanarDistance, SphericalDistance } from "./utils";
import { cities as truePositions } from "./coordinates";

type CityTable = {
  [key in CityName]?: Mesh;
};


type HoveredCityInfo = {
  name: CityName;
  mesh: Mesh;
}


type RenderContextState = { // TODO: Move update into other context
  citiesRef: MutableRefObject<CityTable>;
  hoveredCityRef: MutableRefObject<HoveredCityInfo | null>;
  isDragging: boolean;
  updateCities: (name: CityName, city: Mesh) => void;
  updateHoveredCity: (name: CityName | null) => void;
  moveHoveredCity: (x: number, y: number, z: number) => void;
  setIsDragging: (isDragging: boolean) => void;
}



const RenderContext = createContext<RenderContextState>(null!);

/* NOTE: cities needs to be refactored to an object, because keeping indices consistent might be an issue
 * Thus, cities will be identified by their name, not their index
*/


export function RenderContextProvider({ children }: { children: React.ReactNode }) { // TODO: Refactor for everything to be a ref; Very slow
  const citiesRef = useRef<CityTable>({});
  const hoveredCityRef = useRef<HoveredCityInfo | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const updateCities = (name: CityName, city: Mesh) => {
    citiesRef.current[name] = city;
  };

  const updateHoveredCity = (name: CityName | null) => {
    if (name === null) {
      hoveredCityRef.current = null;
      return;
    }

    const mesh = citiesRef.current[name];
    if (mesh === undefined) throw new Error("invalid city name");
    hoveredCityRef.current = { name, mesh };
    const { x, y, z } = mesh.position;
    moveHoveredCity(x, y, z);
  }

  const moveHoveredCity = (x: number, y: number, z: number) => {
    if (hoveredCityRef.current === null) throw new Error("Trying to move without selecting a city");
    hoveredCityRef.current.mesh.position.set(x, y, z);
  }


  return (
    <RenderContext.Provider value={{ citiesRef, hoveredCityRef, isDragging, setIsDragging, updateCities, updateHoveredCity, moveHoveredCity }}>
      {children}
    </RenderContext.Provider>
  )
}

export function useRenderContext() {
  const context = useContext(RenderContext);
  if (context === null) throw new Error("Could not retreive context");
  return context;
}

export type Distances = {
  [key in CityName]?: {
    [key in CityName]?: number;
  }
}


export type UIContextState = {
  currDistances: Distances;
};

const UIContext = createContext<UIContextState>({ currDistances: {} });

export type UpdateUIContextState = {
  updateCurrDistances: () => void;
};

const UpdateUIContext = createContext<UpdateUIContextState>(null!);

const UpdateContextProvider = memo(function({ children, setCurrDistances }: { children: React.ReactNode, setCurrDistances: (d: Distances) => void }) {
  const { citiesRef } = useRenderContext();
  const updateCurrDistances = useCallback(() => {
    const currDistaces: Distances = {};
    for (const [cityName1, cityMesh1] of Object.entries(citiesRef.current) as [CityName, Mesh][]) {
      for (const [cityName2, cityMesh2] of Object.entries(citiesRef.current) as [CityName, Mesh][]) {
        const distance = PlanarDistance(cityMesh1, cityMesh2);
        if (currDistaces[cityName1] === undefined) currDistaces[cityName1] = {};
        if (currDistaces[cityName2] === undefined) currDistaces[cityName2] = {};
        currDistaces[cityName1][cityName2] = distance;
        currDistaces[cityName2][cityName1] = distance;
      }
    }
    setCurrDistances(currDistaces);

  }, [citiesRef, setCurrDistances]);
  return (
    <UpdateUIContext.Provider value={{ updateCurrDistances }}>
      {children}
    </UpdateUIContext.Provider>
  );
});

export function UIContextProvider({ children }: { children: React.ReactNode }) {
  const [currDistances, setCurrDistances] = useState<Distances>({});
  return (
    <UIContext.Provider value={{ currDistances: currDistances }}>
      <UpdateContextProvider setCurrDistances={setCurrDistances}>
        {children}
      </UpdateContextProvider>
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (context === null) throw new Error("Could not retreive context");
  return context;
}

export function useUpdateContext() { // TODO: add all other update function here, memoize them
  const context = useContext(UpdateUIContext);
  if (context === null) throw new Error("Could not retreive context");
  return context;
}



const realDistances: Distances = {};

export function getRealDistances(): Distances {
  if (Object.keys(realDistances).length === 0) {
    for (const [cityName1, cityMesh1] of Object.entries(truePositions) as [CityName, CityRealCoords][]) {
      for (const [cityName2, cityMesh2] of Object.entries(truePositions) as [CityName, CityRealCoords][]) {
        const distance = SphericalDistance(cityMesh1, cityMesh2);
        if (realDistances[cityName1] === undefined) realDistances[cityName1] = {};
        if (realDistances[cityName2] === undefined) realDistances[cityName2] = {};
        realDistances[cityName1][cityName2] = distance;
        realDistances[cityName2][cityName1] = distance;
      }
    }
  }

  return realDistances;


}
