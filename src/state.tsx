import { createContext, MutableRefObject, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Mesh } from "three";
import { CityName, truePositions } from "./coordinates";

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


export type RenderContextState = {
  citiesRef: MutableRefObject<CityTable>;
  hoveredCityRef: MutableRefObject<HoveredCityInfo | null>;
  isDragging: boolean;
}


/* NOTE: UIContextState is fast state and needs to be a separate context to not trigger rerender on on everything else
 * Alternative is to memoize everything, but I don't think it's prefferable
*/
export type UIContextState = {
  currDistances: Distances;
};

export type UpdateUIContextState = {
  updateCurrDistances: () => void;
  updateCities: (name: CityName, city: Mesh) => void;
  updateHoveredCity: (name: CityName | null) => void;
  moveHoveredCity: (x: number, y: number, z: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  updateAnimationState: (status: AnimationStatus, cityName?: CityName) => void;
};

export type AnimationStatus = 'source' | 'global' | 'solving' | null;
export type AnimationContextState = {
  animations: {
    [key in CityName]?: AnimationStatus
  }
};

const RenderContext = createContext<RenderContextState>(null!);
const UIContext = createContext<UIContextState>({ currDistances: {} });
const UpdateUIContext = createContext<UpdateUIContextState>(null!);
const AnimationContext = createContext<AnimationContextState>(null!);

export function ContextProvider({ children, calculateDistances }: {
  children: React.ReactNode,
  calculateDistances: (cities: CityTable) => Distances
}
) {
  const [currDistances, setCurrDistances] = useState<Distances>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const citiesRef = useRef<CityTable>({});
  const hoveredCityRef = useRef<HoveredCityInfo | null>(null);
  const fillAnimationTable = (val: AnimationStatus) => Object.keys(truePositions).reduce((obj, key) => ({ ...obj, [key as CityName]: val }), {})
  const [animations, setAnimations] = useState<AnimationContextState['animations']>(fillAnimationTable(null));
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
    if (!citiesRef.current) return;
    setCurrDistances(calculateDistances(citiesRef.current));
  }, [calculateDistances]);

  const updateAnimationState = useCallback((status: AnimationStatus, cityName?: CityName) => {
    if (status === 'global') {
      setAnimations(fillAnimationTable('global'));
    } else if (status === null) {
      setAnimations(fillAnimationTable(null));
    } else if (cityName !== undefined) {
      setAnimations((animations) => ({ ...animations, [cityName]: status }))
    }
  }, []);

  const renderContextValue: RenderContextState = useMemo(() => ({
    citiesRef, hoveredCityRef, isDragging
  }), [isDragging]);

  const uiContextValue: UIContextState = useMemo(() => ({
    currDistances
  }), [currDistances]);

  const animationContextValue = useMemo(() => (
    { animations }
  ), [animations]);

  const updateUIContextValue: UpdateUIContextState = useMemo(() => ({
    updateCurrDistances,
    updateCities,
    updateHoveredCity,
    moveHoveredCity,
    setIsDragging,
    updateAnimationState
  }), [moveHoveredCity, updateCities, updateCurrDistances, updateHoveredCity, updateAnimationState]);

  return (
    <RenderContext.Provider value={renderContextValue}>
      <UIContext.Provider value={uiContextValue}>
        <UpdateUIContext.Provider value={updateUIContextValue}>
          <AnimationContext.Provider value={animationContextValue}>
            {children}
          </AnimationContext.Provider>
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

export function useAnimationContext() {
  const context = useContext(AnimationContext);
  if (context === null) throw new Error("Could not retreive context");
  return context;
}

