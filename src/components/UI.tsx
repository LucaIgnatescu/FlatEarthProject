import { useStore } from "../state";
import { CityName, positions } from "../coordinates";
import { computeTotalError, getDistancesLazy } from "../distances";
import { capitalize } from "../utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function TotalError() {
  const nCities = useStore(state => state.nCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const currPositions = useStore(state => state.currPositions);
  const type = useStore(state => state.objectType);

  const totalError = Math.round(computeTotalError(type, currPositions));
  if (nCities !== nRenderedCities) return null;
  return (
    <div className="text-white p-10 text-4xl pointer-events-none select-none">
      {totalError}
    </div>
  );
}


export function RealDistances() {
  const citiesRef = useStore(state => state.citiesRef)
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const type = useStore(state => state.objectType);
  const hoveredCity = useStore(state => state.hoveredCity);

  const cityName = hoveredCity?.name;

  if (nRenderedCities === 0 || cityName === undefined) {
    return null; // TODO: Add some fallback component?
  }

  const distances: { [key in CityName]?: number } = {};
  for (const otherCityName of Object.keys(citiesRef.current) as CityName[]) {
    if (cityName === otherCityName) continue;
    const { trueDistance } = getDistancesLazy(cityName, otherCityName, type, citiesRef);
    distances[otherCityName] = trueDistance;
  }
  return (
    <div className="flex flex-col justify-center text-center w-fit text-white">
      <div className="text-xl border-gray-100 border-b">True Distances</div>
      <div className="flex flex-col justify-around text-left">
        {(Object.keys(distances) as CityName[]).map(city => {
          const city1 = capitalize(cityName);
          const city2 = capitalize(city);
          const distance = Math.round((distances[city] ?? 0) / 10) * 10;
          return <div key={city} className="">{city1} ↔   {city2}: {distance}km</div>
        })}
      </div>
    </div>
  );
}

export function RealDistancesContainer() {
  const base = import.meta.env.BASE_URL;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="text-white">
      <div className={`overflow-hidden ease-linear duration-500 transition-all min-w-fit pointer-events-none
        ${isOpen ?
          "w-full opacity-100 px-10 " :
          "w-0 opacity-0 px-0"}`}>
        <RealDistances />
      </div>
      <br />
      <div onClick={() => setIsOpen(isOpen => !isOpen)}
        className={`transition-all ease-linear duration-500
          ${isOpen ?
            "px-10" :
            "px-0"}`}>
        <div className={`pointer-events-auto align-middle inline-block leading-none hover:cursor-pointer text-center w-fit px-1 py-2 transition-all ease-linear duration-500 rounded-r ${isOpen ?
          "rotate-180 " :
          "rotate-0"}`}>
          <img src={`${base}icons/arrow.svg`} />
        </div>
      </div>
    </div>
  );
}


export function UIContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden w-full h-full absolute top-0 pointer-events-none">
      {children}
    </div>
  );
}


export function CitySlider() {
  const updateNCities = useStore(state => state.updateNCities)
  const nCities = useStore(state => state.nCities);
  return (
    <input type='range' min='1' max={Object.keys(positions).length} value={nCities}
      onChange={(event) => updateNCities(+event.target.value)}
    />
  );
}

export function AboutMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-around text-white text-gray-xs pointer-events-auto">
      <span
        className="bg-blue-500 rounded-tl-xl p-2 hover:cursor-pointer"
        onClick={() => navigate('/about')}
      >
        About
      </span>
      <span
        className="bg-green p-2 text-white hover:cursor-pointer"
        onClick={() => navigate('/bug-report')}
      >
        Report an Issue
      </span>
    </div>
  );
}

export function ContinueGlobe({ text, time }: { text: string, time: number }) {
  const navigate = useNavigate();
  const [timer, setTimer] = useState<number>(-1);
  const done = timer === 0;

  useEffect(() => {
    if (timer === 0) {
      return;
    }
    if (timer === -1) {
      setTimer(time);
    } else {
      setTimeout(() => setTimer(timer - 1), 1000);
    }
  }, [timer, time]);

  if (done) {
    return (
      <div
        className="pointer-events-auto bg-green p-2 text-white hover:cursor-pointer rounded-t-xl"
        onClick={() => navigate('/globe')}
      >
        {text}
      </div>
    )
  }
  return (
    <div className="pointer-events-auto bg-gray-600 p-2 text-white hover:cursor-pointer rounded-t-xl">
      {text}: {timer}s left
    </div>
  );
}
