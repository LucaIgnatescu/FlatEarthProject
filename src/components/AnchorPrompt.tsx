import { useEffect } from "react";
import { useStore } from "../state";

export function AnchorPrompt() {
  const isPicking = useStore(state => state.isPicking);
  const contextMenu = useStore(state => state.contextMenu);
  const updateContextMenu = useStore(state => state.updateContextMenu);
  useEffect(() => {
    if (isPicking && contextMenu.visible) {
      updateContextMenu({ ...contextMenu, visible: false });
    }
  }, [contextMenu, updateContextMenu, isPicking]);
  if (!isPicking) return null;
  return (
    <div className="w-full flex flex-row justify-center top-10">
      <div className="text-lg">
        Choose another city to keep fixed:
      </div>
    </div>
  );
}
