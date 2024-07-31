import { AnchorPrompt } from "./components/AnchorPrompt";
import { ContextMenu } from "./components/ContextMenu";

export function UIWrapper() {
  return (
    <div className="text-white w-full absolute top-0 h-full z-100 pointer-events-none">
      <ContextMenu />
      <AnchorPrompt />
    </div>
  );
}


