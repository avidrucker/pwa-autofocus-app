// import logo from './logo.svg';
import {useState} from 'react';
import { addTask, toggleTaskDone, deleteTask } from './core/tasksManager';
import TodoItem from './TodoItem';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleAddTaskUI = () => {
    if (inputValue.trim()) {
      const updatedTasks = addTask(inputValue);
      setTasks([...updatedTasks]);
      setInputValue(''); // Resetting the input value after adding the task
    }
  };
  
  const handleToggleDoneUI = (index) => {
    const updatedTasks = toggleTaskDone(index);
    setTasks([...updatedTasks]);
};

const handleDeleteUI = (index) => {
  const updatedTasks = deleteTask(index);
  setTasks([...updatedTasks]);
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

        <button className="todo-button" onClick={handleAddTaskUI}>Add</button>
        
        <div className="todo-list">
          {tasks.map((task, index) => (
            <TodoItem 
              key={index} 
              task={task} 
              onToggleDone={() => handleToggleDoneUI(index)}
              onDelete={() => handleDeleteUI(index)}
            />
          ))}
        </div>

        <div>You currently have {tasks.length} items in your list.</div>
      </div>
    </div>
  );
}

export default App;
