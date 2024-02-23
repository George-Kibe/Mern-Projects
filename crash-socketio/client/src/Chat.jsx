import React, { useEffect, useState } from 'react'
import ScrollToBottom from 'react-scroll-to-bottom';


function Chat({socket, username, room}) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
      socket.on('receive_message', data => {
        // console.log(data);
        setMessages([...messages, data]);
        //setMessages(list => [...list, data]);
      });
    }, [socket])
    // console.log("Messages: ", messages)

    const sendMessage = async() => {
        // console.log(message)
        if (message.trim() !== '') {
            const messageData = {
                room: room,
                author: username,
                message: message,
                time: new Date(Date.now()).toLocaleString()
            }
            // console.log(messageData)
            await socket.emit('send_message', messageData);
            setMessages([...messages, messageData]);
            setMessage('');
        }
    }
  return (
    <div className='chat-window'>
      <div className="chat-header">
        <p className="">Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className='message-container'>
          {
            messages.map((m, index) => (
                <div key={index} className="message" id={username === m.author ? "you" : "other"}              >
                    <div>
                    <div className="message-content">
                        <p>{m.message}</p>
                    </div>
                    <div className="message-meta">
                        <p id="time">{m.time}</p>
                        <p id="author">{m.author}</p>
                    </div>
                    </div>
                </div>
            ))
          }
        </ScrollToBottom>
        
      </div>
      <div className="chat-footer">
        <input value={message} 
            onChange={e => setMessage(e.target.value)} 
            onKeyPress={(event) => {
                event.key === "Enter" && sendMessage();
              }}
            type="text" className="" placeholder='Send message...' 
        />
        <button onClick={sendMessage} className="">&#9658;</button>
      </div>
    </div>
  )
}

export default Chat
