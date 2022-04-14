import {
  BrowserRouter as Router,
  Navigate,
  Route
} from "react-router-dom";
import Pay from './components/Pay';
import Success from './components/Success';

const App = () =>{
  return(
    // <>
    //   <Pay />
    //   <Success />
    //   <div>Test Message</div>
    // </>
    <Router>
      <Navigate>
        <Route path="/pay"><Pay /></Route>
        <Route path="/success"><Success /></Route>
      </Navigate>
    </Router>
  )
}


export default App;
