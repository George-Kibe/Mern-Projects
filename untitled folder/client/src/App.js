import { AppBar, Typography } from "@material-ui/core";
import React from "react";
import VideoPlayer from "./components/VideoPlayer";
import Options from "./components/Options";
import Notifications from "./components/Notifications";

function App() {
  return (
    <div>
        <h2 style={{color: 'white'}}> Video Chat </h2>      
      <VideoPlayer />
        <Options>
          <Notifications />
        </Options>
    </div>
  );
}

export default App;
