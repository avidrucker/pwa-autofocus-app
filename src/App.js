import {useState} from 'react';
import { addTask, completeBenchmarkTask, emptyList } from './core/tasksManager';
import TodoItem from './TodoItem';
import './App.css';

function App() {
  const initialTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const [tasks, setTasks] = useState(initialTasks);
  const [inputValue, setInputValue] = useState('');

  const saveTasksToLocal = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const handleAddTaskUI = () => {
    if (inputValue.trim()) {
      const updatedTasks = addTask(tasks, inputValue);
      setTasks(updatedTasks);
      saveTasksToLocal(updatedTasks);
      setInputValue('');
    }
  };

  const handleTakeActionUI = () => {
    const updatedTasks = completeBenchmarkTask(tasks);
    setTasks(updatedTasks);
    saveTasksToLocal(updatedTasks);
  }

  const handleDeleteUI = () => {
    const updatedTasks = emptyList();
    setTasks([...updatedTasks]);
    saveTasksToLocal(updatedTasks);
  };
  
  return (
    <main className="app">
      <header className="app-header">
        <h1>PWA AutoFocus App</h1>
      </header>

      <section className="app-container">
        <input 
          className="todo-input" 
          type="text" 
          placeholder="Add a task..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <div>
          <button className="button" onClick={handleAddTaskUI}>Add</button>
          <button className="button" onClick={handleDeleteUI}>Clear list</button>
          <button className="button" onClick={handleTakeActionUI}>Take Action</button>
        </div>

        <ul className="todo-list">
          {tasks.map(task => (
            <TodoItem 
              key={task.id} 
              task={task} 
            />
          ))}
        </ul>

        <p>You currently have {tasks.length} items in your list.</p>
      </section>
    </main>
  );
}

export default App;
