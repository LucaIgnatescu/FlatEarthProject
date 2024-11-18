import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Tutorial1 } from "./routes/Tutorial1";
import { Tutorial2 } from "./routes/Tutorial2";
import { Tutorial3 } from "./routes/Tutorial3";
import { Tutorial4 } from "./routes/Tutorial4";
import { Tutorial5 } from "./routes/Tutorial5";
import Globe from "./routes/Globe";
import { useMouseTracker } from "./metrics/mouseTracker";
import { useGlobalEvents, useRouteTracker } from "./metrics/useEvents";
import Survey from "./routes/Survey";
import BugReport from "./routes/BugReport";
import About from "./routes/About";
import Plane from "./routes/Plane";

export type Route = 'tutorial1' | 'tutorial2' | 'tutorial3' | 'tutorial4' | 'tutorial5' |
  'globe' | 'plane' | 'survey';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/tutorial/1" replace />
  },
  {
    path: "/tutorial/1",
    element: <Tutorial1 />
  },
  {
    path: "/tutorial/2",
    element: <Tutorial2 />
  },
  {
    path: "/tutorial/3",
    element: <Tutorial3 />
  },
  {
    path: "/tutorial/4",
    element: <Tutorial4 />
  },
  {
    path: "/tutorial/5",
    element: <Tutorial5 />
  },
  {
    path: "/globe",
    element: <Globe />
  },
  {
    path: "/plane",
    element: <Plane />
  },
  {
    path: "/survey",
    element: <Survey />
  },
  {
    path: "/bug-report",
    element: <BugReport />
  },
  {
    path: "/about",
    element: <About />
  }
])
export default function App() {
  useMouseTracker();
  useGlobalEvents();
  useRouteTracker();
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
