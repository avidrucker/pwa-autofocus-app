import {useState, useEffect, useRef} from 'react';
import { addTask, addAll, completeBenchmarkTask, benchmarkItem, 
  emptyList, isActionableList, cancelItem, cloneItem } from './core/tasksManager';
import { startReview, handleReviewDecision, isPrioritizableList, 
  genCurrentQuestion, getInitialCursor } from './core/reviewManager';
import { getFromLocalStorage, saveToLocalStorage } from './core/localStorageAdapter';
import { exportTasksToJSON, importTasksFromJSON } from './core/tasksIO';
import { objectArraysAreEqual } from './core/logicUtils';
import TodoItem from './TodoItem';
import {saveDisk, infoCircle, lightbulbSolid, lightbulbRegular } from './core/icons'
import './App.css';

// TODO: refactor all buttons to change color on hover, focus, active rather than grow
// TODO: implement an 'undo' button that undo's the last action taken, use fa-history icon
// TODO: restrict 'next actionable item' text to 2 lines, end with ellipses if it exceeds that

const activeListOffset = 0;
const queryStringListOffset = 100;
const initialTasksListOffset = 200;

const appName = "AutoFocus";
const infoString2 = "This web app was built by Avi Drucker using ReactJS, Font Awesome, and Tachyons.";
const infoString1 = "The AutoFocus algorithm was designed by Mark Forster as a pen and paper method to help increase productivity. It does so by limiting list interaction and providing a simple (binary) decision-making framework.";
const saveInfo1 = "You can import and export JSON lists into and out of AutoFocus.";
const saveInfo2 = "You can also import a list by pasting in raw text below, and then clicking the 'Submit' button.";
const emptyInputErrMsg1 = "New items cannot be empty or only whitespace.";
const cannotTakeActionErrMsg1 = "There are no actionable tasks in your list.";
const emptyTextAreaErrMsg1 = "New items cannot be empty or whitespace only.";
const badJSONimportErrMsg1 = "Failed to import tasks. Ensure the JSON file has the correct format.";
const nonJSONimportAttemptedErrMsg1 = "Please select a valid JSON file.";
const mismatchDetectedMsg1 = "The link list and local storage list do not match. Which will you keep?";
const confirmListDelete = "Are you sure you want to delete your list? This action cannot be undone.";
const clickDiskToClose = "Click on the 'disk' icon above to close this window.";
const clickIcircleToClose = "Click on the 'i' icon above to close this window.";

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
  const [showingSaveModal, setShowingSaveModal] = useState(false);
  const [importErrMsg, setImportErrMsg] = useState("");
  const inputRef = useRef(null);
  const [showingConflictModal, setShowingConflictModal] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState('');
  const initialTheme = getFromLocalStorage('theme', 'dark');
  const [theme, setTheme] = useState(initialTheme);


  // sets focus to new item text input on initial load
  // Note: this effect runs only once after the initial render 
  // because of the empty dependency array [].
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // sets the background color of the page based on the theme
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('bg-white');
      document.body.classList.remove('bg-black');
    } else {
      document.body.classList.add('bg-black');
      document.body.classList.remove('bg-white');
    }
  }, [theme]);

  useEffect(() => {
    // Attempt to load the list state from the URL
    const listStateWrapperFromURL = deserializeQueryStringToListStateWrapper(window.location.search);

    if(listStateWrapperFromURL.result) {
      if (listStateWrapperFromURL.result.length !== 0 && initialTasks.length === 0) {
        // If URL state is present and local storage is empty, use the URL state
        // console.log("using URL state")
        handleListChange(listStateWrapperFromURL.result);
      } else if (listStateWrapperFromURL.result.length === 0 && initialTasks.length !== 0) {
        // If URL state is not present, default to using local storage state if it exists
        // console.log("URL state not found, defaulting to local storage")
        handleListChange(initialTasks);
      }
       else if (listStateWrapperFromURL.result.length !== 0 && initialTasks.length !== 0) {
        if(objectArraysAreEqual(listStateWrapperFromURL.result, initialTasks)) {
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
      // TODO: detect invalid query string and render error message accordingly
      if(listStateWrapperFromURL.error) {
        // TODO: move error string to top of file
        setErrMsg("Invalid list query parameters detected. Reverting to local storage list data.");
      }
      // invalid query string found or missing query string, so, let's rebuild it 
      // and save it back to the query params
      console.info("rebuilding query params from local storage")
      handleListChange(initialTasks);
    }
    // eslint-disable-next-line
  }, []); // The empty dependency array ensures this effect runs once on mount

  useEffect(()=>{
    saveToLocalStorage('cursor', cursor);
    if(cursor === -1) {
      setIsPrioritizing(false);
    }
    // eslint-disable-next-line
  }, [cursor]);

  useEffect(() => {
    saveToLocalStorage('isPrioritizing', isPrioritizing);
    if(isPrioritizing) {
      setCursor(getInitialCursor(tasks));
    } else {
      setCursor(-1);
    }
    // eslint-disable-next-line
  }, [isPrioritizing])

  // focusing on the input after deleting the list
  useEffect(() => {
    if (!showingDeleteModal && tasks.length === 0) {
      inputRef.current.focus();
    }
  }, [showingDeleteModal, tasks.length]);

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
    saveToLocalStorage('tasks', newListState);
  };

  const handleAddTaskUI = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const updatedTasks = addTask(tasks, inputValue);
      handleListChange(updatedTasks);
      setInputValue('');
    } else {
      setErrMsg(emptyInputErrMsg1);
    }
  };

  const handleTakeActionUI = () => {
    if(!isActionableList(tasks)) {
      setErrMsg(cannotTakeActionErrMsg1);
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
    setShowingSaveModal(false);
    setErrMsg("");
  }

  const handleToggleSaveModal = () => {
    setShowingSaveModal(!showingSaveModal);
    setShowingMoreInfo(false);
    setImportErrMsg("");
    setErrMsg("");
  }

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    saveToLocalStorage('theme', theme === 'light' ? 'dark' : 'light');
  }

  // Function to handle exporting tasks to a JSON file
  const handleExportTasks = () => {
    setImportErrMsg("");
    // TODO: extract out following logic into separate module as per hexagonal architecture
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
        // TODO: move error string to top of file
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
      setImportErrMsg(emptyTextAreaErrMsg1);
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
                // append imported tasks to current tasks,
                // addAll updates ids for 2nd list to 
                // prevent id collisions
                const updatedTasks = addAll(tasks, importedTasks);
                handleListChange(updatedTasks);
            } else {
                setImportErrMsg(badJSONimportErrMsg1);
            }
        };
        reader.readAsText(file);
    } else {
        setErrMsg(nonJSONimportAttemptedErrMsg1);
    }
  };

  // TODO: rename function to better describe intent
  const handleLabelKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      // Prevent the default action to avoid scrolling on Space press
      event.preventDefault();
      // Trigger click on file input
      document.getElementById('file-upload').click();
    }
  };

  const serializeListStateToQueryString = (listState) => {
    // TODO: refactor out btoa w/ Buffer.from(str, 'base64') and buf.toString('base64')
    // Serialize listState to a query-friendly string, such as base64
    const serializedState = btoa(encodeURIComponent(JSON.stringify(listState)));
    return `?list=${serializedState}`;
  };

  const deserializeQueryStringToListStateWrapper = (queryString) => {
    // Extract the 'list' parameter from the query string
    const params = new URLSearchParams(queryString);
    const serializedState = params.get('list');
    if (!serializedState) {
      console.info("No list data found in query parameters.");
      return {result: []}; // TODO: test this as null and as {result: []}
    }
    // Deserialize the state from a query-friendly string
    try {
      // TODO: refactor out atob w/ Buffer.from(str, 'base64') and buf.toString('base64')
      const listState = JSON.parse(decodeURIComponent(atob(serializedState)));
      return {result: listState};
    } catch (error) {
        console.error('Failed to deserialize query string:', error);
        return {error: 'Malformed query string'};
    }
  };

  // takes in the user's choice of new list, updates the list, 
  // and closes the modal
  const handleListConflictChoice = (newListState) => {
    handleListChange(newListState);
    setShowingConflictModal(false);
  }

  // renders a list of tasks, with optional interactive buttons
  // Note: idOffset is here for the purposes of rendering multiple
  // lists at once, such as when evaluating conflicting
  // lists in localStorage and query params.
  // Note: the lists rendered in the conflict modal are not interactive
  const renderList = (inputList, idOffset, interactive) => <div className="ph3">
    <ul className="ph0 todo-list list ma0 tl measure-narrow ml-auto mr-auto">
    {interactive ?
      <> {inputList.map(task => (
        <TodoItem 
          key={task.id + idOffset} 
          task={task}  
          cancelFunc={() => handleListChange(cancelItem(inputList, task.id))}
          cloneFunc={() => handleListChange(cloneItem(inputList, task.id))}
          isBenchmark={benchmarkItem(inputList) !== null && benchmarkItem(inputList).id === task.id}
          theme={theme}
        />))} </> :
      <> {inputList.map(task => (
        <TodoItem 
          key={task.id + idOffset} 
          task={task}
          isBenchmark={benchmarkItem(inputList) !== null && benchmarkItem(inputList).id === task.id}
          theme={theme}
        />
      ))}</>}
    </ul>
  </div>;
  
  return (
    <main className={`app h-100 flex flex-column f5 montserrat ${theme === 'light' ? 'black' : 'white'}`}>
      <header className="app-header pa3 flex justify-center items-center">
        <h1 className="ma0 f2 fw8 tracked-custom dib">{appName}</h1>
        
        <div className="pl3 inline-flex items-center">
          <button 
            type="button" 
            /* TODO: set tab-index of menu items to be after other elements when modals are being shown */
            disabled={isPrioritizing || showingDeleteModal || showingConflictModal }
            className={`button-reset pa1 w2 h2 pointer f5 fw6 grow bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}
            onClick={handleToggleSaveModal}>
              {saveDisk}</button>
        </div>
        
        <div className="pl2 inline-flex items-center">
          <button 
            type="button" 
            disabled={isPrioritizing || showingDeleteModal || showingConflictModal }
            className={`button-reset pa1 w2 h2 pointer f5 fw6 grow bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}
            onClick={handleToggleInfoModal}>
              {infoCircle}</button>
        </div>

        <div className="pl2 inline-flex items-center">
          <button 
            type="button" 
            /*disabled={isPrioritizing || showingDeleteModal || showingConflictModal || showingSaveModal || showingMoreInfo}*/
            className={`button-reset pa1 w2 h2 pointer f5 fw6 grow bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}
            onClick={handleToggleTheme}>
              {theme === 'light' ? lightbulbSolid : lightbulbRegular}</button>
        </div>
      </header>

      <section className="app-container relative flex flex-column h-100">
        <form className="ph3">
          <div>
            <div className="measure-narrow ml-auto mr-auto">
              <input 
                ref={inputRef}
                id="todo-input"
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal}
                className={`todo-input pa2 w-100 input-reset br3 ba bw1 b--gray ${theme === 'light' ? 'black hover-bg-light-gray active-bg-white' : 'white bg-black hover-bg-dark-gray active-bg-black'}'}`} 
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

          {errMsg && <p className="lh-135 red ml-auto mr-auto measure-narrow ma0 pt2">{errMsg}</p>}

          <section className="pt2 pb2 flex justify-center flex-wrap measure-wide ml-auto mr-auto">
            <div className="dib">
              <div className="ma1 dib"><button type="submit" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 ${isPrioritizing ? 'o-50' : 'pointer grow'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal} 
                onClick={handleAddTaskUI}>Add Task</button></div>
              
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 ${tasks.length !== 0 ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal} 
                onClick={handleToggleDeleteModal}>Delete List</button></div>
            </div>

            <div className="dib">
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 ${isPrioritizableList(tasks) ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal} 
                onClick={handlePrioritizeUI}>Prioritize List</button></div>
              
              <div className="ma1 dib"><button type="button" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 ${isActionableList(tasks) ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal} 
                onClick={handleTakeActionUI}>Take Action</button></div>
            </div>
          </section>
        </form>
        
        <section className="">
          {tasks.length > 0 && renderList(tasks, activeListOffset, true)}
        </section>

        <div className="ph3 pb3">
          <p className="ma0 o-50 measure-narrow ml-auto mr-auto lh-135">
            {`You have ${tasks.length} item${tasks.length !== 1 ? 's' : ''} in your list.`}
          </p>

          <p className="ma0 o-50 measure-narrow ml-auto mr-auto lh-135 line-clamp-3 overflow-hidden">
            {(benchmarkItem(tasks) !== null) && `The next actionable item is '${benchmarkItem(tasks).text}'.`}
          </p>
        </div>

        {/*prioritization review modal*/}
        {(isPrioritizing && cursor !== -1 && cursor < tasks.length) && 
          <section className={`absolute f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="measure-narrow ml-auto mr-auto">
              <p className="lh-135">{genCurrentQuestion(tasks, cursor)}</p>
              <div className="tc">
                <button className={`br3 w3 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`}
                        onClick={handleQuitUI}>Quit</button>
                <button className={`br3 w3 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`}
                        onClick={handleNoUI}>No</button>
                <button className={`br3 w3 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`}
                        onClick={handleYesUI}>Yes</button>
              </div>
            </section>
          </section>}

          {/*'are you sure you want to delete your list?' modal*/}
          {showingDeleteModal &&
          <section className={`absolute f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="measure-narrow ml-auto mr-auto">
              <p className="lh-135">{confirmListDelete}</p>
              <div className="tc">
                <button className={`br3 w4 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`}
                        onClick={handleToggleDeleteModal}>No</button>
                <button className={`br3 w4 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`}
                        onClick={handleDeleteUI}>Yes</button>
              </div>
            </section>
          </section>}

          {/*save modal*/}
          {showingSaveModal &&
          <section className={`absolute f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="relative z-1 measure-narrow ml-auto mr-auto tl">

              <p className="ph3 ma0 lh-135">{saveInfo1}</p>
              
              <div className="tc">
                <label 
                  tabIndex="0" 
                  onKeyDown={handleLabelKeyPress}
                  htmlFor="file-upload" 
                  className={`br3 grow dib button-reset border-box w4 f5 fw6 ba bw1 b--gray ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`}>
                <span>Import</span>
                <input id="file-upload" className="dn input-reset"
                    type="file" accept=".json" onChange={handleImportTasks} />
                </label>
                <button className={`br3 w4 f5 fw6 ba dib bw1 grow b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`}
                  onClick={handleExportTasks}>Export</button>
              </div>

              {importErrMsg && 
                <p className="ph3 pt2 ma0 lh-135 measure ml-auto mr-auto red">{importErrMsg}</p>}
              
              <p className="ph3 pt2 ma0 lh-135">{saveInfo2}</p>

              <div className="ph3 pt1">
                <textarea 
                  className={`db input-reset pa2 w-100 resize-none lh-135 br3 ba bw1 b--gray ${theme === 'light' ? 'bg-white' : 'bg-black'}`} 
                  rows="2" 
                  value={textAreaValue}
                  onChange={(e) => {
                    setTextAreaValue(e.target.value);
                    setImportErrMsg("");
                  }}
                  placeholder="Paste your list here, with each item on a new line" />
                <button className={`br3 w-100 f5 fw6 ba dib bw1 grow b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer`} onClick={handleTextImport}>Submit</button>
              </div>
              
              <p className="pt2 ph3 pb3 ma0 lh-135">{clickDiskToClose}</p>
            </section>
            <button className="absolute z-0 top-0 left-0 w-100 o-0 h-100" onClick={handleToggleSaveModal} type="button">Close Save Modal</button>
          </section>}

          {/*app info modal*/}
          {showingMoreInfo &&
          <section className={`absolute ph3 f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="relative z-1 measure-narrow ml-auto mr-auto tl">

              <p className="pb3 ma0 lh-135">{infoString1}</p>

              <p className="pb3 ma0 lh-135">{infoString2}</p>

              <p className="pb3 ma0 lh-135">{clickIcircleToClose}</p>
            </section>
            <button className="absolute z-0 top-0 left-0 w-100 o-0 h-100" onClick={handleToggleInfoModal} type="button">Close Info Modal</button>
          </section>}

          {/*local storage and query params conflict resolution modal*/}
          {showingConflictModal && <section className={`absolute ph3 f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="measure-narrow ml-auto mr-auto tl">
              <p className="ma0 lh-135">{mismatchDetectedMsg1}</p>
              <p className="fw6 ma0 pt2">1. List from the <em>link</em> address:</p>
              {renderList(deserializeQueryStringToListStateWrapper(window.location.search).result, queryStringListOffset)}
              <p className="fw6 ma0 pt2">2. List from <em>local</em> storage:</p>
              {renderList(initialTasks, initialTasksListOffset)}
            </section>
            <div className="pb3">
                <button 
                className={`br3 f5 fw6 ba dib bw1 grow b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`} 
                onClick={() => handleListConflictChoice(deserializeQueryStringToListStateWrapper(window.location.search).result)}>
                  1. Keep <em>link</em> list</button>
              <button
                className={`br3 f5 fw6 ba dib bw1 grow b--gray button-reset ${theme === 'light' ? 'bg-moon-gray' : 'bg-dark-gray white'} pa2 pointer ma1`} 
                onClick={() => handleListConflictChoice(initialTasks)}>
                  2. Keep <em>local</em> list</button>
              </div>
            </section>}

      </section>
    </main>
  );
}

export default App;
