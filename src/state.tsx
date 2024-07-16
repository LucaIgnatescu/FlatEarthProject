import { createContext, MutableRefObject, useContext, useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import { CityName } from "./coordinates";

type CityTable = {
  [key in CityName]?: Mesh;
};


type HoveredCityInfo = {
  name: CityName;
  mesh: Mesh;
}


type CitiesState = {
  citiesRef: MutableRefObject<CityTable>;
  hoveredCityRef: MutableRefObject<HoveredCityInfo | null>;
  isDragging: boolean;
  draggingPosition: { x: number, y: number, z: number } | null;
  updateCities: (name: CityName, city: Mesh) => void;
  updateHoveredCity: (name: CityName | null) => void;
  moveHoveredCity: (x: number, y: number, z: number) => void;
  setIsDragging: (isDragging: boolean) => void;
}



const CityContext = createContext<CitiesState>(null!);

/* NOTE: cities needs to be refactored to an object, because keeping indices consistent might be an issue
 * Thus, cities will be identified by their name, not their index
*/

export function CityContextProvider({ children }: { children: React.ReactNode }) { // TODO: Refactor for everything to be a ref; Very slow
  const citiesRef = useRef<CityTable>({});
  const hoveredCityRef = useRef<HoveredCityInfo | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [draggingPosition, setDraggingPosition] = useState<{ x: number, y: number, z: number } | null>(null);

  const updateCities = (name: CityName, city: Mesh) => {
    citiesRef.current[name] = city;
  };

  const updateHoveredCity = (name: CityName | null) => {
    if (name === null) {
      hoveredCityRef.current = null;
      setDraggingPosition(null);
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
    setDraggingPosition({ x, y, z });
  }


  return (
    <CityContext.Provider value={{ citiesRef, hoveredCityRef, isDragging, draggingPosition, setIsDragging, updateCities, updateHoveredCity, moveHoveredCity }}>
      {children}
    </CityContext.Provider>
  )
}

export function useCityContext() {
  const context = useContext(CityContext);
  if (context === null) throw new Error("Could not retreive context");
  return context;
}
