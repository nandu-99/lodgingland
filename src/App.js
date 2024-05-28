import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./components/homepage";
import SignIn from './components/signin';
import SignUp from './components/signup';
import "./index.css";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      children: [
        {
          path: "signin",
          element: <SignIn />,
        },
        {
          path: "signup",
          element: <SignUp />,
        },
      ]
    }
  ]);
  return <RouterProvider router={router} />;
}

export default App;

