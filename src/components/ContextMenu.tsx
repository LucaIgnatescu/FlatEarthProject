import { useRef } from "react";
import { useStore } from "../state";
import { startAnimation } from "../animation";

export function ContextMenu() {
  const contextMenu = useStore(state => state.contextMenu);
  const updateContextMenu = useStore(state => state.updateContextMenu);
  const ref = useRef<HTMLDivElement>(null!);
  const updateAnimationState = useStore(state => state.updateAnimationState);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const updateIsPicking = useStore(state => state.updateIsPicking);
  const isAnimating = useStore(state => state.isAnimating);
  const type = useStore(state => state.objectType);
  const { cityName } = contextMenu;
  if (isAnimating || contextMenu.visible === false || contextMenu.mousePosition === null || cityName === null) {
    console.log(isAnimating, contextMenu)
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
          if (type === 'sphere') {
            startAnimation(updateAnimationState, updateHoveredCity, 'global');
            closeMenu();
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
