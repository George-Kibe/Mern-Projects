import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Product from "./pages/Product";
import ProductList from "./pages/ProductList";
import Register from "./pages/Register";
import {
  BrowserRouter as Router,
  Routes, Redirect,
  Route
} from "react-router-dom";

const App = () => {
  const user =true
  return (
    <div>     
      <Router>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/cart' element={<Cart/>} />          
          <Route path='/product/:id' element={<Product/>} />
          <Route path='/products/:category' element={<ProductList/>} />
          <Route path='/login'  element={<Login/>} />
          <Route path='/register' element={<Register/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
