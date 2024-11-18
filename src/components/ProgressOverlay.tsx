import { useStore } from "../state";


const mappings = {
  'tutorial1': 1,
  'tutorial2': 2,
  'tutorial3': 3,
  'tutorial4': 4,
  'tutorial5': 5,
};

const nSections = Object.keys(mappings).length;

export default function ProgressBar() {
  const route = useStore(state => state.route);
  if (route === null || !(route in mappings)) {
    return null;
  }

  const progress = mappings[route as keyof typeof mappings];

  return (
    <div className="bg-green p-2 text-white rounded-tl-xl">
      Tutorial Section {progress} / {nSections}
    </div>
  );
}

export function ProgressOverlay() {
  return (
    <div className="top-0 left-0 fixed w-full h-full z-10">
      <div className="flex flex-col justify-end w-full h-full">
        <div className="flex flex-row justify-end w-full h-fit">
          <ProgressBar />
        </div>
      </div>
    </div>
  );
}
