import { createContext, useContext, useRef } from "react";
import { Mesh } from "three";
import { CityName } from "./coordinates";

type CityTable = {
  [key in CityName]?: Mesh;
};

type CitiesState = {
  citiesRef: React.MutableRefObject<CityTable>;
  updateCities: (name: CityName, city: Mesh) => void;
}

const CityContext = createContext<CitiesState>(null!);

/* NOTE: cities needs to be refactored to an object, because keeping indices consistent might be an issue
 * Thus, cities will be identified by their name, not their index
*/

export function CityContextProvider({ children }: { children: React.ReactNode }) {
  const citiesRef = useRef<CityTable>({});
  const updateCities = (name: CityName, city: Mesh) => {
    citiesRef.current[name] = city;
  };
  return (
    <CityContext.Provider value={{ citiesRef, updateCities }}>
      {children}
    </CityContext.Provider>
  )
}

export function useCityContext() {
  const context = useContext(CityContext);
  if (context === null) throw new Error("Could not retreive context");
  return context;
}
