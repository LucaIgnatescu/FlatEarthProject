import { useRef } from "react";
import { useStore } from "../state";
import { CityName } from "../coordinates";
import { getDistancesLazy } from "../distances";
import { postSolve } from "../metrics/postMetrics";

export function ContextMenu() {
  const contextMenu = useStore(state => state.contextMenu);
  const updateContextMenu = useStore(state => state.updateContextMenu);
  const ref = useRef<HTMLDivElement>(null!);
  const updateAnimationState = useStore(state => state.updateAnimationState);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const isAnimating = useStore(state => state.isAnimating);
  const type = useStore(state => state.objectType);
  const citiesRef = useStore(state => state.citiesRef);
  const token = useStore(state => state.jwt);

  const cities = Object.keys(citiesRef.current) as CityName[];
  const { cityName } = contextMenu;

  if (isAnimating || contextMenu.visible === false || contextMenu.mousePosition === null || cityName === null) {
    return null;
  }

  const [x, y] = contextMenu.mousePosition;

  const getClosestPoint = () => {
    let minDistance = Infinity;
    let minCity = null;
    for (const otherCity of cities) {
      if (otherCity === cityName) {
        continue;
      }
      const { currDistance } = getDistancesLazy(cityName, otherCity, type, citiesRef);
      if (currDistance < minDistance) {
        minDistance = currDistance;
        minCity = otherCity;
      }
    }
    if (minCity === null) {
      throw new Error("could not find closest city")
    }
    return minCity;
  }


  const closeMenu = () => updateContextMenu({ ...contextMenu, visible: false });
  return (
    <div
      style={{ // NOTE: Cannot use tailwind here because pixel values are dynamic
        top: y,
        left: x,
      }}
      className={"text-sm pointer-events-auto absolute bg-white text-black flex flex-row flex-auto justify-between opacity-90 p-2 rounded  *:p-1  *:px-2"}
      ref={ref}
    >
      <button onClick={() => {
        updateHoveredCity(cityName);
        updateAnimationState('fixed', cityName);
        closeMenu();
        if (token != null) {
          postSolve(token, "fixed", cityName);
        }
      }}>
        Solve City
      </button>
      <button className="border-l border-l-gray-500"
        onClick={() => {
          updateHoveredCity(cityName);
          updateAnimationState('global');
          if (type === 'plane') {
            const closestPoint = getClosestPoint();
            const newMenu = { ...contextMenu, anchor: closestPoint, visible: false };
            updateContextMenu(newMenu);
          } else {
            closeMenu();
          }
          if (token != null) {
            postSolve(token, "global");
          }
        }}
      >
        Solve Globally
      </button>
      <button className="border-l border-l-gray-500"
        onClick={closeMenu}>
        Close
      </button>
    </div>
  );
}
