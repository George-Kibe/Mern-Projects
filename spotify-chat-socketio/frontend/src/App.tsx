import { Route, Routes } from "react-router-dom";
import ChatPage from "./pages/chat/ChatPage";
import { Toaster } from "react-hot-toast";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import NotFoundPage from "./pages/404/NotFoundPage";
import HomePage from "./pages/home/HomePage";
import MainLayout from "./layout/MainLayout";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

const App = () => {
  return (
    <>
			<Routes>
				<Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
				/>
				<Route path='/auth-callback' element={<AuthCallbackPage />} />
				{/* <Route path='/admin' element={<AdminPage />} /> */}

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/chat' element={<ChatPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>
			<Toaster />
		</>
  )
}

export default App