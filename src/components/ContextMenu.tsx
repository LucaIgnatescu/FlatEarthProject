import { useRef } from "react";
import { useStore } from "../state";
import { startAnimation } from "../animation";

export function ContextMenu() {
  const contextMenu = useStore(state => state.contextMenu);
  const updateContextMenu = useStore(state => state.updateContextMenu);
  const ref = useRef<HTMLDivElement>(null!);
  const route = useStore(state => state.route);
  const updateAnimationState = useStore(state => state.updateAnimationState);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const updateIsPicking = useStore(state => state.updateIsPicking);

  const { cityName } = contextMenu;

  if (contextMenu.visible === false || contextMenu.mousePosition === null || cityName === null) {
    return null;
  }

  const [x, y] = contextMenu.mousePosition;

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
        startAnimation(updateAnimationState, updateHoveredCity, 'fixed', cityName);
        closeMenu();
      }}>
        Solve City
      </button>
      <button className="border-l border-l-gray-500"
        onClick={() => {
          if (route === 'sphere') {
            startAnimation(updateAnimationState, updateHoveredCity, 'global', cityName);
            closeMenu();
            updateHoveredCity(cityName);
            updateAnimationState('global')
          } else {
            updateIsPicking(true);
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
