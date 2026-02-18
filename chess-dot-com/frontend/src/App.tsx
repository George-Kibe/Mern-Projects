import { Suspense } from "react";
import { RecoilRoot } from "recoil";
import { Loader } from "./components/Loader";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./layout";
import Landing from "./screens/Landing";
import Login from "./screens/Login";
import Game from "./screens/Game";
import Settings from "./screens/Settings";
import Analyze from "./screens/Analyze";

function App() {
  return (
    <div className="min-h-screen bg-bgMain text-textMain">
      <RecoilRoot>
        <Suspense fallback={<Loader />}>
          {/* <ThemesProvider> */}
            <AuthApp />
          {/* </ThemesProvider> */}
        </Suspense>
      </RecoilRoot>
    </div>
  );
}

function AuthApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<Layout><Landing /></Layout>} 
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/games/:gameId"
          element={<Layout><Game /></Layout>}
        />
         <Route
          path="/analysis"
          element={<Layout><Analyze /></Layout>}
        />
        <Route 
          path='/settings' 
          element={<Layout><Settings /></Layout>} 
        >
          {/* <Route path="themes" element={<Themes />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;