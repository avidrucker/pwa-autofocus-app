// import logo from './logo.svg';
import {useState} from 'react';
import TodoItem from './TodoItem';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleAddTask = () => {
    if (inputValue.trim()) {
      setTasks([...tasks, { text: inputValue, done: false }]);
      setInputValue('');
    }
  };

  const handleToggleDone = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const handleDelete = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>pwa-todo-app</h1>
      </header>

      <div className="app-container">
        <input 
          className="todo-input" 
          type="text" 
          placeholder="Add a task..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <button className="todo-button" onClick={handleAddTask}>Add</button>
        
        <div className="todo-list">
          {tasks.map((task, index) => (
            <TodoItem 
              key={index} 
              task={task} 
              onToggleDone={() => handleToggleDone(index)}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;
