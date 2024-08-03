import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Tutorial from './routes/Tutorial.tsx';
import Globe from './routes/Globe.tsx';
import Plane from './routes/Plane.tsx';
import './index.css';

export type Route = 'tutorial' | 'sphere' | 'plane'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/tutorial",
    element: <Tutorial />
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
