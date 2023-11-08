import {useState, useEffect, useRef} from 'react';
import { addTask, addAll, completeBenchmarkTask, benchmarkItem, emptyList, isActionableList } from './core/tasksManager';
import { startReview, handleReviewDecision, isPrioritizableList, genQuestion, getInitialCursor } from './core/reviewManager';
import { getFromLocalStorage, saveToLocalStorage } from './core/localStorageAdapter';
import { exportTasksToJSON, importTasksFromJSON } from './core/tasksIO';
import TodoItem from './TodoItem';
import './App.css';

const activeListOffset = 0;
const queryStringListOffset = 100;
const initialTasksListOffset = 200;

function objectsAreEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false; // If the objects have different numbers of properties, they are not equal
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false; // If any property values are different, the objects are not equal
    }
  }

  return true; // If no differences were found, the objects are equal
}

function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false; // If the lengths are different, the arrays are not equal
  }

  // Sort the arrays by a unique property to ensure the order doesn't affect the comparison
  const sortedArr1 = arr1.slice().sort((a, b) => a.id - b.id);
  const sortedArr2 = arr2.slice().sort((a, b) => a.id - b.id);

  for (let i = 0; i < sortedArr1.length; i++) {
    if (!objectsAreEqual(sortedArr1[i], sortedArr2[i])) {
      return false; // If any objects are not equal, the arrays are not equal
    }
  }

  return true; // If no differences were found, the arrays are equal
}

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
  const inputRef = useRef(null);
  const [showingConflictModal, setShowingConflictModal] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState('');

  // This effect runs only once after the initial render 
  // because of the empty dependency array [].
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Attempt to load the list state from the URL
    const listStateFromURL = deserializeQueryStringToListState(window.location.search);

    if(listStateFromURL) {
      if (listStateFromURL.length !== 0 && initialTasks.length === 0) {
        // If URL state is present and local storage is empty, use the URL state
        // console.log("using URL state")
        handleListChange(listStateFromURL);
      } else if (listStateFromURL.length === 0 && initialTasks.length !== 0) {
        // If URL state is not present, default to using local storage state if it exists
        // console.log("URL state not found, defaulting to local storage")
        handleListChange(initialTasks);
      }
       else if (listStateFromURL.length !== 0 && initialTasks.length !== 0) {
        if(arraysAreEqual(listStateFromURL, initialTasks)) {
          // we don't have to do anything if the query params and local storage list match
          // console.log("list from query params and list from local storage are the same")
        } else {
          // however, if we have two different lists from query params and local storage,
          // we will prompt the user to choose which one to use
          // console.log("conflict found, activating conflict resolution modal")
          setShowingConflictModal(true);
        }
      } else {
        // Neither state exists, so we will have an empty default list
        // console.log("No state found in address bar or local storage")
        handleListChange(initialTasks);
      }
    } else {
      // invalid query string found or missing query string, so, let's rebuild it 
      // and save it back to the query params
      console.log("rebuilding query params from local storage")
      handleListChange(initialTasks);
    }

  }, []); // The empty dependency array ensures this effect runs once on mount

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

  const handleListChange = (newListState) => {
    // Serialize the new state to a query string
    const queryString = serializeListStateToQueryString(newListState);
  
    // Update the URL without reloading the page
    window.history.pushState({}, '', queryString);
  
    setTasks(newListState);
    saveTasksToLocal(newListState);
  };

  const handleAddTaskUI = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const updatedTasks = addTask(tasks, inputValue);
      handleListChange(updatedTasks);
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
      handleListChange(updatedTasks);
      setErrMsg("");
    }
  }

  const handleDeleteUI = () => {
    const updatedTasks = emptyList();
    handleListChange(updatedTasks);
    setErrMsg("");
    setShowingDeleteModal(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleNoUI = () => {
    const result = handleReviewDecision(tasks, cursor, "No");
    setCursor(result.cursor);
  }

  const handleYesUI = () => {
    const result = handleReviewDecision(tasks, cursor, "Yes");
    setCursor(result.cursor);
    handleListChange(result.tasks);
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

  // Function to handle importing tasks from raw text
  const handleTextImport = () => {
    if (textAreaValue.trim()) {
      const lines = textAreaValue.split("\n");
      let updatedTasks = tasks;
      for(let i = 0; i < lines.length; i++) {
        updatedTasks = addTask(updatedTasks, lines[i]);
      }
      handleListChange(updatedTasks);
      setTextAreaValue('');
    } else {
      setImportErrMsg("New items cannot be empty or whitespace only.");
    }
  }

  // Function to handle importing tasks from a JSON file
  const handleImportTasks = (event) => {
    setImportErrMsg("");
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            const importedTasks = importTasksFromJSON(e.target.result);
            if (importedTasks) {
                // append imported tasks to current tasks, addAll updates
                // ids for 2nd list to prevent id collisions
                const updatedTasks = addAll(tasks, importedTasks);
                handleListChange(updatedTasks);
            } else {
                setImportErrMsg("Failed to import tasks. Ensure the JSON file has the correct format.");
            }
        };
        reader.readAsText(file);
    } else {
        setErrMsg("Please select a valid JSON file.");
    }
  };

  const handleLabelKeyPress = (event) => {
    // Check for Enter or Space key
    if (event.key === 'Enter' || event.key === ' ') {
      // Prevent the default action to avoid scrolling on Space press
      event.preventDefault();
      // Trigger click on file input
      document.getElementById('file-upload').click();
    }
  };

  const serializeListStateToQueryString = (listState) => {
    // Serialize listState to a query-friendly string, such as base64
    const serializedState = btoa(encodeURIComponent(JSON.stringify(listState)));
    return `?list=${serializedState}`;
  };

  const deserializeQueryStringToListState = (queryString) => {
    // Extract the 'list' parameter from the query string
    const params = new URLSearchParams(queryString);
    const serializedState = params.get('list');
    if (!serializedState) return null;
  
    // Deserialize the state from a query-friendly string
    try {
      const listState = JSON.parse(decodeURIComponent(atob(serializedState)));
      return listState;
    } catch (error) {
      console.error('Failed to deserialize query string:', error);
      return null;
    }
  };

  const handleListConflictChoice = (newListState) => {
    handleListChange(newListState);
    setShowingConflictModal(false);
  }

  const renderList = (inputList, idOffset) => <div className="ph3 pb3">
    <ul className="ph0 todo-list list ma0 tl measure-narrow ml-auto mr-auto">
      {inputList.map(task => (
        <TodoItem 
          key={task.id + idOffset} 
          task={task} 
          isBenchmark={benchmarkItem(inputList) !== null && benchmarkItem(inputList).id === task.id}
        />
      ))}
    </ul>
  </div>
  
  return (
    <main className="app flex flex-column tc f5 montserrat black bg-white vh-100">
      <header className="app-header pa3 flex justify-center items-center">
        <h1 className="ma0 f3 f2-ns fw8 tracked-custom dib">AutoFocus</h1>
        <div className="dib pl3">
          <button 
            type="button" 
            disabled={isPrioritizing || showingDeleteModal || showingConflictModal}
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
                ref={inputRef}
                id="todo-input"
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal}
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

          {errMsg && <p className="lh-copy red ml-auto mr-auto measure ma0 pt3 ph3 balance">{errMsg}</p>}

          <section className="pv3 flex justify-center flex-wrap measure-wide ml-auto mr-auto">
            <div className="dib">
              <div className="ma1 dib"><button type="submit" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${isPrioritizing ? 'o-50' : 'pointer grow'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal} 
                onClick={handleAddTaskUI}>Add Task</button></div>
              
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${tasks.length !== 0 ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal} 
                onClick={handleToggleDeleteModal}>Delete List</button></div>
            </div>

            <div className="dib">
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${isPrioritizableList(tasks) ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal} 
                onClick={handlePrioritizeUI}>Prioritize List</button></div>
              
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 ${isActionableList(tasks) ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal} 
                onClick={handleTakeActionUI}>Take Action</button></div>
            </div>
          </section>
        </form>
        
        {tasks.length > 0 && renderList(tasks, activeListOffset)}

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

          {/*'are you sure you want to delete your list?' modal*/}
          {showingDeleteModal &&
          <section className="absolute f4 top-0 w-100 h-100 bg-white-90">
            <p className="ph3 lh-copy balance">Are you sure you want to delete your list?</p>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleToggleDeleteModal}>No</button>
            <button className="br3 w3 fw6 ba bw1 b--gray button-reset bg-moon-gray pa2 pointer ma1"
                    onClick={handleDeleteUI}>Yes</button>
          </section>}

          {/*app info modal*/}
          {showingMoreInfo &&
          <section className="absolute f4 top-0 w-100 h-100 bg-white-90">
            <section className="relative z-1 measure-narrow ml-auto mr-auto tl">

              <p className="ph3 pb3 ma0 lh-copy">AutoFocus was designed by Mark Forster. This web app was built by Avi Drucker.</p>

              <p className="ph3 ma0 lh-copy">You can import and export JSON lists into and out of AutoFocus.</p>
              
              <div className="pb3 tc">
                <label 
                  tabIndex="0" 
                  onKeyDown={handleLabelKeyPress}
                  htmlFor="file-upload" 
                  className="br3 grow dib button-reset border-box w4 f5 fw6 ba bw1 b--gray bg-moon-gray pa2 pointer ma1">
                <span>Import</span>
                <input id="file-upload" className="dn input-reset"
                    type="file" accept=".json" onChange={handleImportTasks} />
                </label>
                <button className="br3 w4 f5 fw6 ba dib bw1 grow b--gray button-reset bg-moon-gray pa2 pointer ma1"
                  onClick={handleExportTasks}>Export</button>
              </div>

              {importErrMsg && 
                <p className="ph3 pb3 ma0 lh-copy measure ml-auto mr-auto red">{importErrMsg}</p>}
              
              <p className="ph3 pb1 ma0 lh-copy">You can also import a text list directly by pasting in text below, and then clicking the 'Submit' button.</p>

              <div className="ph3">
                <textarea 
                  className="db input-reset pa2 w-100 resize-none lh-copy br3 ba bw1 b--gray" 
                  rows="2" 
                  value={textAreaValue}
                  onChange={(e) => {
                    setTextAreaValue(e.target.value);
                    setImportErrMsg("");
                  }}
                  placeholder="Paste your list here, with each item on a new line" />
                <button className="br3 w-100 f5 fw6 ba dib bw1 grow b--gray button-reset bg-moon-gray pa2 pointer" onClick={handleTextImport}>Submit</button>
              </div>
              
              <p className="ph3 pt3 ma0 lh-copy balance">Click on the 'i' icon above to close this window.</p>
            </section>
            <button className="absolute z-0 top-0 left-0 w-100 o-0 vh-75" onClick={handleToggleInfoModal} type="button">Close Info Modal</button>
          </section>}

          {/*local storage and query params conflict resolution modal*/}
          {showingConflictModal && <section className="absolute f4 top-0 w-100 h-100 bg-white-90">
            <p className="ph3 pb3 ma0 lh-copy measure ml-auto mr-auto tl">There is a mismatch between the list loaded from the link address and what is saved locally. Which list would you like to continue working with?</p>
            <p className="fw6">1. List from the <em>link</em> address:</p>
            {renderList(deserializeQueryStringToListState(window.location.search), queryStringListOffset)}
            <p className="fw6">2. List from <em>local</em> storage:</p>
            {renderList(initialTasks, initialTasksListOffset)}
            <button 
              className="br3 f5 fw6 ba dib bw1 grow b--gray button-reset bg-moon-gray pa2 pointer ma1" 
              onClick={() => handleListConflictChoice(deserializeQueryStringToListState(window.location.search))}>
                1. Keep <em>link</em> list</button>
            <button
              className="br3 f5 fw6 ba dib bw1 grow b--gray button-reset bg-moon-gray pa2 pointer ma1" 
              onClick={() => handleListConflictChoice(initialTasks)}>
                2. Keep <em>local</em> list</button>
            </section>}

      </section>
    </main>
  );
}

export default App;
