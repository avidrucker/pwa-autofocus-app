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
  const [errMsg, setErrMsg] = useState("");

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

  const handleAddTaskUI = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const updatedTasks = addTask(tasks, inputValue);
      setTasks(updatedTasks);
      saveTasksToLocal(updatedTasks);
      setInputValue('');
    } else {
      setErrMsg("New items cannot be empty or whitespace only, please type some text into the text input above");
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
    <main className="app flex flex-column tc f5 montserrat black bg-white vh-100">
      <header className="app-header pa3">
        <h1 className="ma0 f2 fw8 tracked-custom">AutoFocus</h1>
      </header>

      <section className="app-container relative">
        <form className="ph3">
          <div className="measure ml-auto mr-auto">
            <input 
              id="todo-input"
              disabled={isPrioritizing}
              className="todo-input pa2 w-100 input-reset br3" 
              type="text" 
              placeholder="Add a task..." 
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setErrMsg("");
              }}
            />
          </div>

          {errMsg && <p className="lh-copy red ma0 pt3 ph3">{errMsg}</p>}

          <div className="pv3 flex justify-center flex-wrap measure ml-auto mr-auto">
            
            <div className="ma1"><button type="submit" 
              className={`br3 fw6 bn button-reset bg-moon-gray pa2 ${isPrioritizing ? 'o-80' : 'pointer'}`} 
              disabled={isPrioritizing} 
              onClick={handleAddTaskUI}>Add</button></div>
            
            <div className="ma1"><button type="button" 
              className={`br3 fw6 bn button-reset bg-moon-gray pa2 ${isPrioritizing && 'o-80'} ${tasks.length !== 0 && 'pointer'}`} 
              disabled={isPrioritizing || tasks.length === 0} 
              onClick={handleDeleteUI}>Clear List</button></div>
            
            <div className="ma1"><button type="button" 
              className={`br3 fw6 bn button-reset bg-moon-gray pa2 ${isPrioritizableList(tasks) ? 'pointer' : 'o-80'}`} 
              disabled={!isPrioritizableList(tasks) || isPrioritizing} 
              onClick={handlePrioritizeUI}>Prioritize List</button></div>
            
            <div className="ma1"><button type="button" 
              className={`br3 fw6 bn button-reset bg-moon-gray pa2 ${isPrioritizing && 'o-80'} ${isActionableList(tasks) && 'pointer'}`} 
              disabled={isPrioritizing || !isActionableList(tasks)} 
              onClick={handleTakeActionUI}>Take Action</button></div>

          </div>
        </form>

        <ul className="todo-list list ma0 pv2 tl measure ml-auto mr-auto">
          {tasks.map(task => (
            <TodoItem 
              key={task.id} 
              task={task} 
            />
          ))}
        </ul>

        <p className="ma0 pv3">{`You currently have ${tasks.length} item${tasks.length !== 1 ? 's' : ''} in your list.`}</p>

        {/*prioritization review modal*/}
        {isPrioritizing && 
          <div className="absolute f4 top-0 w-100 h-100 bg-white-80">
            <p className="ph3 lh-copy">{cursor !== -1 && genQuestion(tasks, cursor)}</p>
            <button className="br3 w3 fw6 bn button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handlePrioritizeUI}>Quit</button>
            <button className="br3 w3 fw6 bn button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleNoUI}>No</button>
            <button className="br3 w3 fw6 bn button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleYesUI}>Yes</button>
          </div>}
      </section>
    </main>
  );
}

export default App;
