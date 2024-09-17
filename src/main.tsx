import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Globe from './routes/Globe.tsx';
import Plane from './routes/Plane.tsx';
import './index.css';
import { Tutorial1 } from './routes/Tutorial1.tsx';
import { Tutorial2 } from './routes/Tutorial2.tsx';
import { Tutorial3 } from './routes/Tutorial3.tsx';
import { Tutorial4 } from './routes/Tutorial4.tsx';
import { Tutorial5 } from './routes/Tutorial5.tsx';

export type Route = 'tutorial1' | 'tutorial2' | 'tutorial3' | 'tutorial4' | 'tutorial5' |
  'sphere' | 'plane';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
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
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
