import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from './Pages/Home.jsx';
import Register from './Pages/Register.jsx';
import Root from './Pages/Root.jsx';
import Lend from './Pages/Lend.jsx';
import ItemDetail from './Pages/ItemDetail.jsx';
import Admin from './Pages/Admin.jsx';
import Profile from './Pages/Profile.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children: [
      { path: '/', element: <Home /> },
      { path: '/lend', element: <Lend /> },
      { path: '/item/:id', element: <ItemDetail /> },
      { path: '/register', element: <Register /> } ,
      {path: '/profile', element: <Profile></Profile>}// Moved inside Root
    ]
  },
  {
    path: 'admin',
    element: <Admin></Admin>
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
