import { createContext, MutableRefObject, useContext, useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import { CityName } from "./coordinates";

type CityTable = {
  [key in CityName]?: Mesh;
};

type CitiesState = {
  citiesRef: MutableRefObject<CityTable>;
  hoveredCity: CityName | null;
  hoveredPosition: Vector3 | null;
  isDragging: boolean;
  updateCities: (name: CityName, city: Mesh) => void;
  setHoveredCity: (city: CityName | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setHoveredPosition: (newPosition: Vector3 | null) => void;
}

const CityContext = createContext<CitiesState>(null!);

/* NOTE: cities needs to be refactored to an object, because keeping indices consistent might be an issue
 * Thus, cities will be identified by their name, not their index
*/

export function CityContextProvider({ children }: { children: React.ReactNode }) { // TODO: Refactor for everything to be a ref; Very slow
  const citiesRef = useRef<CityTable>({});
  const [hoveredCity, setHoveredCity] = useState<CityName | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoveredPosition, setHoveredPosition] = useState<Vector3 | null>(null);
  const updateCities = (name: CityName, city: Mesh) => {
    citiesRef.current[name] = city;
  };
  return (
    <CityContext.Provider value={
      { citiesRef, hoveredCity, setHoveredCity, updateCities, isDragging, setIsDragging, hoveredPosition, setHoveredPosition }
    }>
      {children}
    </CityContext.Provider>
  )
}

export function useCityContext() {
  const context = useContext(CityContext);
  if (context === null) throw new Error("Could not retreive context");
  return context;
}
