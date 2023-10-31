import {useState, useEffect} from 'react';
import { addTask, completeBenchmarkTask, benchmarkItem, emptyList, isActionableList, 
  isPrioritizableList, genQuestion, getInitialCursor } from './core/tasksManager';
import { startReview, handleReviewDecision } from './core/reviewManager';
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
  const [showingDeleteModal, setShowingDeleteModal] = useState(false);

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
    const result = startReview(tasks);
    if (result.error) {
        setErrMsg(result.error);
    } else {
        setIsPrioritizing(!isPrioritizing);
        setCursor(result.cursor);
        setErrMsg("");
    }
  };

  const handleAddTaskUI = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const updatedTasks = addTask(tasks, inputValue);
      setTasks(updatedTasks);
      saveTasksToLocal(updatedTasks);
      setInputValue('');
    } else {
      setErrMsg("New items cannot be empty or whitespace only, please type some text into the text input above and then tap 'Add Task'.");
    }
  };

  const handleTakeActionUI = () => {
    if(!isActionableList(tasks)) {
      setErrMsg("There are no actionable tasks in your list.");
    } else {
      const updatedTasks = completeBenchmarkTask(tasks);
      setTasks(updatedTasks);
      saveTasksToLocal(updatedTasks);
      setErrMsg("");
    }
  }

  const handleDeleteUI = () => {
    const updatedTasks = emptyList();
    setTasks([...updatedTasks]);
    saveTasksToLocal(updatedTasks);
    setErrMsg("");
    setShowingDeleteModal(false);
  };

  const handleNoUI = () => {
    const result = handleReviewDecision(tasks, cursor, "No");
    setCursor(result.cursor);
  }

  const handleYesUI = () => {
    const result = handleReviewDecision(tasks, cursor, "Yes");
    setCursor(result.cursor);
    setTasks([...result.tasks]);
    saveTasksToLocal(result.tasks);
  }

  const handleQuitUI = () => {
    const result = handleReviewDecision(tasks, cursor, "Quit");
    setCursor(result.cursor);
    setIsPrioritizing(false);
  }

  const handleToggleDeleteModal = () => {
    if(tasks.length === 0) {
      setErrMsg("There are no tasks to clear.");
    } else {
      setShowingDeleteModal(!showingDeleteModal); 
    }
  }
  
  return (
    <main className="app flex flex-column tc f5 montserrat black bg-white vh-100">
      <header className="app-header pa3">
        <h1 className="ma0 f2 fw8 tracked-custom">AutoFocus</h1>
      </header>

      <section className="app-container relative">
        <form className="ph3">
          <div>
            <div className="measure-narrow ml-auto mr-auto">
              <input 
                id="todo-input"
                disabled={isPrioritizing}
                className="todo-input pa2 w-100 input-reset br3 ba bw1 b--gray" 
                type="text" 
                placeholder="Add a task..." 
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setErrMsg("");
                }}
              />
            </div>
          </div>

          {errMsg && <p className="lh-copy red ma0 pt3 ph3 balance">{errMsg}</p>}

          <div className="pv3 flex justify-center flex-wrap measure-wide ml-auto mr-auto">
            
            <div className="dib">
              <div className="ma1 dib"><button type="submit" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${isPrioritizing ? 'o-50' : 'pointer grow'}`} 
                disabled={isPrioritizing} 
                onClick={handleAddTaskUI}>Add Task</button></div>
              
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${tasks.length !== 0 ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing} 
                onClick={handleToggleDeleteModal}>Clear List</button></div>
            </div>
            className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${isPrioritizing ? 'o-50' : 'pointer grow'}`} 
                disabled={isPrioritizing} 
                onClick={handleAddTaskUI}>Add Task</button></div>
              
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${tasks.length !== 0 ? 'pointer grow' : 'o-50'}`} 
                disabled={isPri
            <div className="dib">
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${isPrioritizableList(tasks) ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing} 
                onClick={handlePrioritizeUI}>Prioritize List</button></div>
              
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${isActionableList(tasks) ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing} 
                onClick={handleTakeActionUI}>Take Action</button></div>
            </div>
          </div>
        </form>
        
        {tasks.length > 0 && <div className="ph3 pb3">
          <ul className="ph0 todo-list list ma0 tl measure-narrow ml-auto mr-auto">
            {tasks.map(task => (
              <TodoItem 
                key={task.id} 
                task={task} 
                isBenchmark={benchmarkItem(tasks) !== null && benchmarkItem(tasks).id === task.id}
              />
            ))}
          </ul>
        </div>}

        <div className="ph3 pb3">
          <p className="ma0 measure-narrow ml-auto mr-auto lh-copy balance">
            {`You have ${tasks.length} item${tasks.length !== 1 ? 's' : ''} in your list.`}
          </p>

          <p className="ma0 measure-narrow ml-auto mr-auto lh-copy balance">
            {(benchmarkItem(tasks) !== null) && `The next actionable item is '${benchmarkItem(tasks).text}'.`}
          </p>
        </div>

        {/*prioritization review modal*/}
        {isPrioritizing && 
          <div className="absolute f4 top-0 w-100 h-100 bg-white-80">
            <p className="ph3 lh-copy balance">{cursor !== -1 && genQuestion(tasks, cursor)}</p>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleQuitUI}>Quit</button>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleNoUI}>No</button>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleYesUI}>Yes</button>
          </div>}

          {showingDeleteModal &&
          <div className="absolute f4 top-0 w-100 h-100 bg-white-80">
            <p className="ph3 lh-copy balance">Are you sure you want to delete your list?</p>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleToggleDeleteModal}>No</button>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleDeleteUI}>Yes</button>
          </div>}
      </section>
    </main>
  );
}

export default App;
