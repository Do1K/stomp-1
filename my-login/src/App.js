import logo from './logo.svg';
import './App.css';
import WebSocketComponent from './WebSocketComponent';
import PostSpace from './PostSpace';


function App() {
  return (
    <div className="App">
        <WebSocketComponent />
      
        <PostSpace/>
    </div>
  );
}

export default App;
