import {useState, useEffect} from 'react';
import { addTask, completeBenchmarkTask, emptyList, isActionableList, 
  isPrioritizableList, genQuestion, getInitialCursor, markReadyAtIndex, nextCursor } from './core/tasksManager';
import TodoItem from './TodoItem';
import './App.css';

function App() {
  const initialTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const [tasks, setTasks] = useState(initialTasks);
  const [inputValue, setInputValue] = useState('');
  const initialPrioritizing = JSON.parse(localStorage.getItem('isPrioritizing') || false);
  const [isPrioritizing, setIsPrioritizing] = useState(initialPrioritizing);
  const initialCursor = JSON.parse(localStorage.getItem('cursor') || -1);
  const [cursor, setCursor] = useState(initialCursor);

  useEffect(()=>{
    saveCursorToLocal();
    if(cursor === -1) {
      setIsPrioritizing(false);
    }
    // eslint-disable-next-line
  }, [cursor]);

  useEffect(() => {
    saveIsPrioritizingToLocal();
    if(isPrioritizing) {
      setCursor(getInitialCursor(tasks));
    } else {
      setCursor(-1);
    }
    // eslint-disable-next-line
  }, [isPrioritizing])

  const saveTasksToLocal = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const saveCursorToLocal = () => {
    localStorage.setItem('cursor', JSON.stringify(cursor));
  };

  const saveIsPrioritizingToLocal = () => {
    localStorage.setItem('isPrioriziting', JSON.stringify(isPrioritizing));
  };

  const handlePrioritizeUI = () => {
    setIsPrioritizing(!isPrioritizing);
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

  const handleNoUI = () => {
    setCursor(nextCursor(tasks, cursor + 1));
  }

  const handleYesUI = () => {
    const updatedTasks = markReadyAtIndex(tasks, cursor);
    setCursor(nextCursor(tasks, cursor));
    setTasks([...updatedTasks]);
    saveTasksToLocal(updatedTasks);
  }
  
  return (
    <main className="app">
      <header className="app-header">
        <h1>PWA AutoFocus App</h1>
      </header>

      <section className="app-container">
        <input 
          disabled={isPrioritizing}
          className="todo-input" 
          type="text" 
          placeholder="Add a task..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <div>
          <button className="button" disabled={isPrioritizing || inputValue === ""} onClick={handleAddTaskUI}>Add</button>
          <button className="button" disabled={isPrioritizing || tasks.length === 0} onClick={handleDeleteUI}>Clear List</button>
          <button className="button" disabled={!isPrioritizableList(tasks)} onClick={handlePrioritizeUI}>Prioritize List</button>
          <button className="button" disabled={isPrioritizing || !isActionableList(tasks)} onClick={handleTakeActionUI}>Take Action</button>
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

        {isPrioritizing && 
          <div>
            <p>{cursor !== -1 && genQuestion(tasks, cursor)}</p>
            <button onClick={handlePrioritizeUI}>Quit</button>
            <button onClick={handleNoUI}>No</button>
            <button onClick={handleYesUI}>Yes</button>
          </div>}
      </section>
    </main>
  );
}

export default App;
