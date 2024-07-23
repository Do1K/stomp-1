import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Client } from '@stomp/stompjs';
import $ from 'jquery';

const WebSocketComponent = () => {
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [joinMessage, setJoinMessage] = useState([]);

  useEffect(() => {
    const newClient = new Client({
      brokerURL: 'ws://192.168.31.224:8080/gs-guide-websocket', // Spring Boot WebSocket URL
      connectHeaders: {
        login: 'user',
        passcode: 'password',
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    newClient.onConnect = (frame) => {
      setConnected(true);
      console.log('Connected: ' + frame);
      newClient.subscribe('/topic/greetings', (greeting) => {
        showGreeting(JSON.parse(greeting.body).content);
      });

      newClient.subscribe('/topic/chatRoom/3', (response) => {
        const messageContent = response.body;
        console.log('Received message:', messageContent);
        joinChat(messageContent);
      });

      // 참여 메시지를 보냅니다.
      newClient.publish({ destination: '/app/join', body: JSON.stringify({ username: 'User', roomId: 3, time: new Date() }) });
    };

    newClient.onWebSocketError = (error) => {
      console.error('Error with websocket', error);
    };

    newClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    setClient(newClient);
  }, []);

  const showGreeting = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const joinChat = (message) => {
    setJoinMessage((prevMessages) => [...prevMessages, message]);
  };

  const connect = async (e) => {
    e.preventDefault();
    if (client) {
      client.activate();
    }
  };

  const disconnect = (e) => {
    e.preventDefault();
    if (client) {
      client.deactivate();
      setConnected(false);
      console.log("Disconnected");
    }
  };

  const sendName = (e) => {
    e.preventDefault();
    if (client && name) {
      client.publish({ destination: '/app/hello', body: JSON.stringify({ name }) });
      setName('');
    }
  };

  return (
    <div id="main-content" className="container">
      <noscript>
        <h2 style={{ color: '#ff0000' }}>
          Seems your browser doesn't support Javascript! Websocket relies on Javascript being enabled. Please enable
          Javascript and reload this page!
        </h2>
      </noscript>
      <div className="row">
        <div className="col-md-6">
          <form className="form-inline" onSubmit={connect}>
            <div className="form-group">
              <label htmlFor="connect">WebSocket connection:</label>
              <button id="connect" className="btn btn-default" type="submit" disabled={connected}>
                Connect
              </button>
              <button id="disconnect" className="btn btn-default" type="submit" onClick={disconnect} disabled={!connected}>
                Disconnect
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-6">
          <form className="form-inline" onSubmit={sendName}>
            <div className="form-group">
              <label htmlFor="name">What is your name?</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Your name here..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button id="send" className="btn btn-default" type="submit" disabled={!connected}>
              Send
            </button>
          </form>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <table id="conversation" className="table table-striped">
            <thead>
              <tr>
                <th>Greetings</th>
              </tr>
            </thead>
            <tbody id="greetings">
              {messages.map((message, index) => (
                <tr key={index}>
                  <td>{message}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <h3>Join Message</h3>
            {joinMessage.map((message, index) => (
                <tr key={index}>
                  <td>{message}</td>
                </tr>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketComponent;
