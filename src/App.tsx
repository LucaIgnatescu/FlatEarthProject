import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Tutorial1 } from "./routes/Tutorial1";
import { Tutorial2 } from "./routes/Tutorial2";
import { Tutorial3 } from "./routes/Tutorial3";
import { Tutorial4 } from "./routes/Tutorial4";
import { Tutorial5 } from "./routes/Tutorial5";
import Globe from "./routes/Globe";
import { useMouseTracker } from "./metrics/mouseTracker";
import { useGlobalEvents, useProgressionTracker } from "./metrics/useEvents";
import BugReport from "./routes/BugReport";
import About from "./routes/About";
import Plane from "./routes/Plane";
import Home from "./routes/Home";
import NotFound from "./routes/NotFound";

export type Route = 'tutorial1' | 'tutorial2' | 'tutorial3' | 'tutorial4' | 'tutorial5' |
  'globe' | 'plane' | 'survey1' | 'survey2';



function Root() {
  useMouseTracker();
  useGlobalEvents();
  // useProgressionTracker();

  return <Outlet />;
}

const base = import.meta.env.BASE_URL || "/";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
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
        path: "/bug-report",
        element: <BugReport />
      },
      {
        path: "/about",
        element: <About />
      }
    ]
  },
], { basename: base })

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
