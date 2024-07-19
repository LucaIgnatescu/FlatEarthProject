import { createContext, memo, MutableRefObject, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Mesh } from "three";
import { CityName } from "./coordinates";
import { PlanarDistance } from "./utils";

export type Distances = {
  [key in CityName]?: {
    [key in CityName]?: number;
  }
}

type CityTable = {
  [key in CityName]?: Mesh;
};


type HoveredCityInfo = {
  name: CityName;
  mesh: Mesh;
}


type RenderContextState = {
  citiesRef: MutableRefObject<CityTable>;
  hoveredCityRef: MutableRefObject<HoveredCityInfo | null>;
  isDragging: boolean;
}


/* NOTE: UIContextState is fast state and needs to be a separate context to not trigger rerender on on everything else
 * Alternative is to memoize everything, but I don't think it's prefferable
*/
type UIContextState = {
  currDistances: Distances;
};

type UpdateUIContextState = {
  updateCurrDistances: () => void;
  updateCities: (name: CityName, city: Mesh) => void;
  updateHoveredCity: (name: CityName | null) => void;
  moveHoveredCity: (x: number, y: number, z: number) => void;
  setIsDragging: (isDragging: boolean) => void;
};

const RenderContext = createContext<RenderContextState>(null!);
const UIContext = createContext<UIContextState>({ currDistances: {} });
const UpdateUIContext = createContext<UpdateUIContextState>(null!);

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [currDistances, setCurrDistances] = useState<Distances>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const citiesRef = useRef<CityTable>({});
  const hoveredCityRef = useRef<HoveredCityInfo | null>(null);

  const updateCities = useCallback((name: CityName, city: Mesh) => {
    citiesRef.current[name] = city;
  }, []);

  const moveHoveredCity = useCallback((x: number, y: number, z: number) => {
    if (hoveredCityRef.current === null) throw new Error("Trying to move without selecting a city");
    hoveredCityRef.current.mesh.position.set(x, y, z);
  }, []);

  const updateHoveredCity = useCallback((name: CityName | null) => {
    if (name === null) {
      hoveredCityRef.current = null;
      return;
    }

    const mesh = citiesRef.current[name];
    if (mesh === undefined) throw new Error("invalid city name");
    hoveredCityRef.current = { name, mesh };
    const { x, y, z } = mesh.position;
    moveHoveredCity(x, y, z);
  }, [moveHoveredCity]);

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
  }, [setCurrDistances]);

  const renderContextValue: RenderContextState = useMemo(() => ({
    citiesRef, hoveredCityRef, isDragging
  }), [isDragging]);

  const uiContextValue: UIContextState = useMemo(() => ({
    currDistances
  }), [currDistances]);

  const updateUIContextValue: UpdateUIContextState = useMemo(() => ({
    updateCurrDistances,
    updateCities,
    updateHoveredCity,
    moveHoveredCity,
    setIsDragging
  }), [moveHoveredCity, updateCities, updateCurrDistances, updateHoveredCity]);

  return (
    <RenderContext.Provider value={renderContextValue}>
      <UIContext.Provider value={uiContextValue}>
        <UpdateUIContext.Provider value={updateUIContextValue}>
          {children}
        </UpdateUIContext.Provider>
      </UIContext.Provider>
    </RenderContext.Provider>
  );
}

export function useRenderContext() {
  const context = useContext(RenderContext);
  if (context === null) throw new Error("Could not retreive context");
  return context;
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
