import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './PostSpace.css';
import { Client } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';

const ItemTypes = {
  NOTE: 'note',
};

const Note = ({ note, index, moveNote, moveToBoard }) => {
  const [, ref] = useDrag({
    type: ItemTypes.NOTE,
    item: { index, from: 'list' },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.NOTE,
    hover: (draggedItem) => {
      if (draggedItem.index !== index && draggedItem.from === 'list') {
        moveNote(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    drop: (draggedItem) => {
      if (draggedItem.from === 'list') {
        moveToBoard(draggedItem.index);
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="note">
      <p>{note}</p>
    </div>
  );
};

const Board = ({ notes, moveToBoard }) => {
  const [, drop] = useDrop({
    accept: ItemTypes.NOTE,
    drop: (item) => moveToBoard(item.index),
  });

  return (
    <div ref={drop} className="board">
      {notes.map((note, index) => (
        <div key={index} className="note">
          <p>{note}</p>
        </div>
      ))}
    </div>
  );
};

const PostSpace = () => {
  const [notes, setNotes] = useState([]);
  const [boardNotes, setBoardNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [clientId] = useState(uuidv4());

  useEffect(() => {
    const newClient = new Client({
      brokerURL: 'ws://192.168.25.3:8080/gs-guide-websocket', // Spring Boot WebSocket URL
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
      newClient.subscribe('/topic/common', (message) => {
        const receivedMessage = JSON.parse(message.body);
        if (receivedMessage.clientId !== clientId) {
          showGreeting(receivedMessage.content);
        }
      });
    };

    newClient.onWebSocketError = (error) => {
      console.error('Error with websocket', error);
    };

    newClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
    newClient.activate();
    setClient(newClient);

    return () => {
      newClient.deactivate();
    };
  }, [clientId]);

  const showGreeting = (note) => {
    setBoardNotes((prevNotes) => [...prevNotes, note]);
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote('');
    }
  };

  const moveNote = (fromIndex, toIndex) => {
    const updatedNotes = [...notes];
    const [movedNote] = updatedNotes.splice(fromIndex, 1);
    updatedNotes.splice(toIndex, 0, movedNote);
    setNotes(updatedNotes);
  };

  const moveToBoard = (index) => {
    const updatedNotes = [...notes];
    const [movedNote] = updatedNotes.splice(index, 1);
    sendMemo(movedNote);
    setNotes(updatedNotes);
    
  };

  const sendMemo = (memo) => {
    console.log(memo);
    if (client && memo) {
      const memoContent = typeof memo === 'object' ? memo : { content: memo };
      client.publish({ destination: '/app/memo', body: JSON.stringify({ ...memoContent, clientId }) });
      
    }

  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <div className="note-input">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="새 포스트잇 작성"
          />
          <button onClick={addNote}>추가</button>
        </div>
        <div className="notes">
          {notes.map((note, index) => (
            <Note key={index} index={index} note={note} moveNote={moveNote} moveToBoard={moveToBoard} />
          ))}
        </div>
        <Board notes={boardNotes} moveToBoard={moveToBoard} />
      </div>
    </DndProvider>
  );
};

export default PostSpace;
