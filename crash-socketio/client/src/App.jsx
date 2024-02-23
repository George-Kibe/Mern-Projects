import { useState } from 'react';
import './App.css';
import io from "socket.io-client";
import Chat from './Chat';

const socket = io.connect('http://localhost:8000');

function App() {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  const joinRoom = () => {
    // handle join room logic
    if (username !== '' && room !== '') {
      socket.emit('join_room', room);
      setShowChat(true);
    }

  }
  return (
    <div className="App">
      {
        !showChat? (
          <div className="joinChatContainer">
            <h3>Join a Chat</h3>
            <input value={username} onChange={e => setUsername(e.target.value)} type="text" placeholder="Enter your name" />
            <input value={room} onChange={e => setRoom(e.target.value)}  type="text" placeholder="Enter Room Id" />
            <button onClick={joinRoom} className="">Join A Room</button>
          </div>
        ): (
          <Chat socket={socket} username={username} room={room} />
        )
      }
      
    </div>
  );
}

export default App;
