import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Product from "./pages/Product";
import ProductList from "./pages/ProductList";
import Register from "./pages/Register";
import Success from "./pages/Success"
//continue from 1:41:00 lamadev
import {
  BrowserRouter as Router,
  Routes, Navigate,
  Route
} from "react-router-dom";
import { useSelector } from "react-redux";

const App = () => {
  const user = useSelector(state => state.user.currentUser)
  return (
    <div>     
      <Router>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/cart' element={<Cart/>} /> 
          <Route path='/success' element={<Success />} />          
          <Route path='/product/:id' element={<Product/>} />
          <Route path='/products/:category' element={<ProductList/>} />
          {user ? <Route path="/login" element={<Navigate replace to="/" />} /> :
          <Route path='/login'  element={<Login/>} />
          }
          <Route path='/register' element={<Register/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
