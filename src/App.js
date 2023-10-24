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
    <main className="app flex flex-column tc f5 montserrat">
      <header className="app-header pa3">
        <h1 className="ma0 f2 fw8">PWA AutoFocus App</h1>
      </header>

      <section className="app-container ph3">
        <form className="">
          <div className="measure ml-auto mr-auto">
          <input 
            id="todo-input"
            disabled={isPrioritizing}
            className="todo-input pa2 w-100 input-reset br3" 
            type="text" 
            placeholder="Add a task..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          </div>

          <div className="pv3 flex justify-center flex-wrap measure ml-auto mr-auto">
            <div className="ma1"><button type="submit" className="button-reset pointer pa2" disabled={isPrioritizing || inputValue === ""} onClick={handleAddTaskUI}>Add</button></div>
            <div className="ma1"><button type="button" className="button-reset pointer pa2" disabled={isPrioritizing || tasks.length === 0} onClick={handleDeleteUI}>Clear List</button></div>
            <div className="ma1"><button type="button" className="button-reset pointer pa2" disabled={!isPrioritizableList(tasks)} onClick={handlePrioritizeUI}>Prioritize List</button></div>
            <div className="ma1"><button type="button" className="button-reset pointer pa2" disabled={isPrioritizing || !isActionableList(tasks)} onClick={handleTakeActionUI}>Take Action</button></div>
          </div>
        </form>

        <ul className="todo-list ma0 pv2 tl measure ml-auto mr-auto">
          {tasks.map(task => (
            <TodoItem 
              key={task.id} 
              task={task} 
            />
          ))}
        </ul>

        <p className="ma0 pt3">{`You currently have ${tasks.length} item${tasks.length !== 1 ? 's' : ''} in your list.`}</p>

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
