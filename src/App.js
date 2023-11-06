import {useState, useEffect} from 'react';
import { addTask, completeBenchmarkTask, benchmarkItem, emptyList, isActionableList } from './core/tasksManager';
import { startReview, handleReviewDecision, isPrioritizableList, genQuestion, getInitialCursor } from './core/reviewManager';
import { getFromLocalStorage, saveToLocalStorage } from './core/localStorageAdapter';
import { exportTasksToJSON, importTasksFromJSON } from './core/tasksIO';
import TodoItem from './TodoItem';
import './App.css';


function App() {
  const initialTasks = getFromLocalStorage('tasks', []);
  const [tasks, setTasks] = useState(initialTasks);
  const [inputValue, setInputValue] = useState('');
  const initialPrioritizing = getFromLocalStorage('isPrioritizing', false);
  const [isPrioritizing, setIsPrioritizing] = useState(initialPrioritizing);
  const initialCursor = getFromLocalStorage('cursor', -1);
  const [cursor, setCursor] = useState(initialCursor);
  const [errMsg, setErrMsg] = useState("");
  const [showingDeleteModal, setShowingDeleteModal] = useState(false);
  const [showingMoreInfo, setShowingMoreInfo] = useState(false);
  const [importErrMsg, setImportErrMsg] = useState("");

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
    saveToLocalStorage('tasks', tasks);
  };

  const saveCursorToLocal = () => {
    saveToLocalStorage('cursor', cursor);
  };

  const saveIsPrioritizingToLocal = () => {
    saveToLocalStorage('isPrioritizing', isPrioritizing);
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

  const handleToggleInfoModal = () => {
    setShowingMoreInfo(!showingMoreInfo);
    setImportErrMsg("");
  }

  // Function to handle exporting tasks to a JSON file
  const handleExportTasks = () => {
    setImportErrMsg("");
    const json = exportTasksToJSON(tasks);
    if (json) {
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.json';
        a.click();
        URL.revokeObjectURL(url);
    } else {
        setErrMsg("Failed to export tasks.");
    }
  };

  // Function to handle importing tasks from a JSON file
  const handleImportTasks = (event) => {
    setImportErrMsg("");
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            const importedTasks = importTasksFromJSON(e.target.result);
            if (importedTasks) {
                setTasks([...tasks, ...importedTasks]);  // append imported tasks to current tasks
                saveTasksToLocal([...tasks, ...importedTasks]); ////
            } else {
                setImportErrMsg("Failed to import tasks. Ensure the JSON file has the correct format.");
            }
        };
        reader.readAsText(file);
    } else {
        setErrMsg("Please select a valid JSON file.");
    }
  };
  
  return (
    <main className="app flex flex-column tc f5 montserrat black bg-white vh-100">
      <header className="app-header pa3 flex justify-center items-center">
        <h1 className="ma0 f3 f2-ns fw8 tracked-custom dib">AutoFocus</h1>
        <div className="dib pl3">
          <button 
            type="button" 
            className="button-reset w2 h2 pointer f5 fw6 grow bg-moon-gray br-100 ba bw1 b--gray "
            onClick={handleToggleInfoModal}>
              i</button>
        </div>
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

          <section className="pv3 flex justify-center flex-wrap measure-wide ml-auto mr-auto">
            <div className="dib">
              <div className="ma1 dib"><button type="submit" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${isPrioritizing ? 'o-50' : 'pointer grow'}`} 
                disabled={isPrioritizing} 
                onClick={handleAddTaskUI}>Add Task</button></div>
              
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${tasks.length !== 0 ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing} 
                onClick={handleToggleDeleteModal}>Delete List</button></div>
            </div>

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
          </section>
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
        {(isPrioritizing && cursor !== -1 && cursor < tasks.length) && 
          <section className="absolute f4 top-0 w-100 h-100 bg-white-90">
            <p className="ph3 lh-copy balance">{genQuestion(tasks, cursor)}</p>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleQuitUI}>Quit</button>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleNoUI}>No</button>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleYesUI}>Yes</button>
          </section>}

          {showingDeleteModal &&
          <section className="absolute f4 top-0 w-100 h-100 bg-white-90">
            <p className="ph3 lh-copy balance">Are you sure you want to delete your list?</p>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleToggleDeleteModal}>No</button>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleDeleteUI}>Yes</button>
          </section>}

          {showingMoreInfo &&
          <section className="absolute f4 top-0 w-100 h-100 bg-white-90">
            <section className="relative z-1 measure-narrow ml-auto mr-auto">
              <p className="ph3 ma0 lh-copy balance">Here you can import (load) and export (save) JSON lists.</p>
              
              <div className="pv3">
                <label forhtml="file-upload" className="br3 grow dib button-reset border-box w4 f5 fw6 ba bw1 b--gray bg-moon-gray pa2 pointer ma1">
                <span>Import</span>
                <input id="file-upload" className="dn input-reset"
                    type="file" accept=".json" onChange={handleImportTasks} />
                </label>
                <button className="br3 w4 f5 fw6 ba dib bw1 grow b--gray button-reset bg-moon-gray pa2 pointer ma1"
                  onClick={handleExportTasks}>Export</button>
              </div>
              {importErrMsg && 
                <p className="ph3 pb3 ma0 lh-copy balance red">{importErrMsg}</p>}
              <p className="ph3 ma0 lh-copy balance">AutoFocus was designed by Mark Forster. This web app was built by Avi Drucker.</p>
              <p className="ph3 pt3 ma0 lh-copy balance">Click on the 'i' icon above to close this window.</p>
            </section>
            <button className="absolute z-0 top-0 left-0 w-100 o-0 vh-75" onClick={handleToggleInfoModal} type="button">Close Info Modal</button>
          </section>}
      </section>
    </main>
  );
}

export default App;
