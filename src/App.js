import {useState, useEffect, useRef} from 'react';
import { addTask, addAll, completeBenchmarkTask, benchmarkItem, 
  emptyList, isActionableList, cancelItem, cloneItem } from './core/tasksManager';
import { startReview, handleReviewDecision, isPrioritizableList, 
  genCurrentQuestion, getInitialCursor } from './core/reviewManager';
import { getFromLocalStorage, saveToLocalStorage } from './core/localStorageAdapter';
import { exportTasksToJSON, importTasksFromJSON, importTasksFromString } from './core/tasksIO';
import { objectArraysAreEqual } from './core/logicUtils';
import TodoItem from './TodoItem';
import {saveDisk, infoCircle, questionCircle, lightbulbSolid, lightbulbRegular } from './core/icons'
import './App.css';

// TODO: refactor all buttons to change color on hover, focus, active rather than grow
// TODO: implement an 'undo' button that undo's the last action taken, use fa-history icon
// TODO: restrict 'next actionable item' text to 2 lines, end with ellipses if it exceeds that

const activeListOffset = 0;
const queryStringListOffset = 100;
const initialTasksListOffset = 200;

const appName = "AutoFocus";
const infoString2 = "This web app was built by Avi Drucker using ReactJS, Font Awesome, and Tachyons CSS.";
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
const instructions = "Add new items to your list by typing into the input box and clicking 'Add Task'. To prioritize your list, click 'Prioritize List'. To mark the next actionable item as complete, click 'Mark Done'. To delete all items from your list, click 'Delete List'.";
const instructions2 = "Click the 'disk' icon to see options for list import/export. Click the 'i' icon to learn more about AutoFocus. Click the 'lightbulb' icon to toggle light/dark mode. Click the 'question mark' icon for instructions on how to use this app.";
const clickQuestionCircleToClose = "Click on the 'question mark' icon above to close this window.";
const clickIcircleToClose = "Click on the 'i' icon above to close this window.";
const invalidQueryParamsErrMsg1 = "Invalid list query parameters detected. Reverting to local storage list data.";
const nothingToDeleteErrMsg1 = "There is nothing to delete.";
const rebuildingQueryParamsConsoleMsg1 = "rebuilding query params from local storage";
const exportFailErrMsg1 = "Failed to export tasks.";
const howToReportIssues = "To report any issues/bugs, please leave a ticket on the GitHub repo 'Issues' page here: ";

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
  const [showingHelpModal, setShowingHelpModal] = useState(false);


  // sets focus to new item text input on initial load
  // Note: this effect runs only once after the initial render 
  // because of the empty dependency array [].
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // TODO: test setting main element bg color instead of body
  // now that html, body, and the #root div are all 100% height
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

  // useEffect that loads list state on page load, attempts to get a list from
  // the URL and local storage, checks for any errors or potential conflicts
  useEffect(() => {
    // Attempt to load the list state from the URL
    const listStateWrapperFromURL = deserializeQueryStringToListStateWrapper(window.location.search);

    if(listStateWrapperFromURL.result) {
      if (listStateWrapperFromURL.result.length !== 0 && initialTasks.length === 0) {
        // If URL state is present and local storage is empty, use the URL state
        // console.info("using URL state")
        handleListChange(listStateWrapperFromURL.result);
      } else if (listStateWrapperFromURL.result.length === 0 && initialTasks.length !== 0) {
        // If URL state is not present, default to using local storage state if it exists
        // console.info("URL state not found, defaulting to local storage")
        handleListChange(initialTasks);
      }
       else if (listStateWrapperFromURL.result.length !== 0 && initialTasks.length !== 0) {
        if(objectArraysAreEqual(listStateWrapperFromURL.result, initialTasks)) {
          // we don't have to do anything if the query params and local storage list match
          // console.info("list from query params and list from local storage are the same")
        } else {
          // however, if we have two different lists from query params and local storage,
          // we will prompt the user to choose which one to use
          // console.info("conflict found, activating conflict resolution modal")
          setShowingConflictModal(true);
        }
      } else {
        // Neither state exists, so we will have an empty default list
        // console.info("No state found in address bar or local storage")
        handleListChange(initialTasks);
      }
    } else {
      if(listStateWrapperFromURL.error) {
        setErrMsg(invalidQueryParamsErrMsg1);
      }
      // TODO: confirm there is no valid 'else' path here
      // invalid query string found or missing query string, so
      // let's rebuild it and save it back to the query params
      console.info(rebuildingQueryParamsConsoleMsg1);
      handleListChange(initialTasks);
    }
    // eslint-disable-next-line
  }, []); // The empty dependency array ensures this effect runs once on mount

  // useEffect that save cursor to local storage every time the cursor changes
  // it also sets the isPrioritizing state to false if the cursor is -1
  useEffect(()=>{
    saveToLocalStorage('cursor', cursor);
    if(cursor === -1) {
      setIsPrioritizing(false);
    }
    // eslint-disable-next-line
  }, [cursor]);

  // useEffect that saves isPrioritizing to local storage every time it changes
  // it also updates the cursor to either the first reviewable item or -1 
  // depending on whether or not isPrioritizing is true
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

  // TODO: implement 'y', 'n', and 'q' keypresses for prioritization review
  // here we will add a keypress listener to the window that is added and
  // removed based on whether isPrioritizing is true or false
  // we will use this to handle the 'y', 'n', and 'q' keypresses
  // useEffect(() => {
  //   if (isPrioritizing) {
  //     // the correct syntax should look like
  //     // window.addEventListener('keypress', handleKehandleYNQkeyPressyPress);
  //     // q: can I pass multiple functions as an array of functions?
  //     window.addEventListener('keypress', handleYNQkeyPress);
  //   } else {
  //     window.removeEventListener('keypress', handleYNQkeyPress);
  //   }
  //   return () => {
  //     // cleanup function
  //     window.removeEventListener('keypress', handleYNQkeyPress);
  //   }
  //   // eslint-disable-next-line
  // }, [isPrioritizing]);

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

  // const handleYNQkeyPress = (event) => {
  //   if (event.key === 'y') {
  //     console.log("y key pressed");
  //     handleYesUI();
  //   } else if (event.key === 'n') {
  //     console.log("n key pressed");
  //     handleNoUI();
  //   } else if (event.key === 'q') {
  //     console.log("q key pressed");
  //     handleQuitUI();
  //   }
  // }

  const handleToggleDeleteModal = () => {
    if(tasks.length === 0) {
      setErrMsg(nothingToDeleteErrMsg1);
    } else {
      setShowingDeleteModal(!showingDeleteModal); 
    }
  }

  const handleToggleInfoModal = () => {
    setShowingMoreInfo(!showingMoreInfo);
    setShowingSaveModal(false);
    setShowingHelpModal(false);
    setErrMsg("");
  }

  const handleToggleHelpModal = () => {
    setShowingHelpModal(!showingHelpModal);
    setShowingSaveModal(false);
    setShowingMoreInfo(false);
    setErrMsg("");
  }

  const handleToggleSaveModal = () => {
    setShowingSaveModal(!showingSaveModal);
    setShowingMoreInfo(false);
    setShowingHelpModal(false);
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
        setErrMsg(exportFailErrMsg1);
    }
  };

  // Function to handle importing tasks from raw text
  const handleTextImport = () => {
    if (textAreaValue.trim()) {
      let updatedTasks = importTasksFromString(tasks, textAreaValue);
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

  // Function to handle importing tasks from a JSON file
  const handleLabelKeyPressForJSONimport = (event) => {
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
        // TODO: move errors strings to top of file, decide whether 
        // to use verbose or custom error messages
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
      <header className="overflow-x-hidden overflow-y-hidden app-header pa3 pb2 flex justify-center items-center">
        <h1 className={`ma0 f2-ns f3 fw8 tracked-custom dib ${theme === 'light' ? 'gray' : 'gray'}`}>{appName}</h1>
        
        <div className="pl3 inline-flex items-center">
          <button 
            type="button" 
            title="Import/Export"
            /* TODO: set tab-index of menu items to be after other elements when modals are being shown */
            disabled={isPrioritizing || showingDeleteModal || showingConflictModal }
            className={`button-reset pa1 w2 h2 pointer f5 fw6 grow bg-transparent bn ${theme === 'light' ? 'gray' : 'gray'}`}
            onClick={handleToggleSaveModal}>
              {saveDisk}</button>
        </div>
        
        <div className="pl2 inline-flex items-center">
          <button 
            title="About"
            type="button" 
            disabled={isPrioritizing || showingDeleteModal || showingConflictModal }
            className={`button-reset pa1 w2 h2 pointer f5 fw6 grow bg-transparent bn ${theme === 'light' ? 'gray' : 'gray'}`}
            onClick={handleToggleInfoModal}>
              {infoCircle}</button>
        </div>

        <div className="pl2 inline-flex items-center">
          <button 
            title="Help"
            type="button" 
            disabled={isPrioritizing || showingDeleteModal || showingConflictModal }
            className={`button-reset pa1 w2 h2 pointer f5 fw6 grow bg-transparent bn ${theme === 'light' ? 'gray' : 'gray'}`}
            onClick={handleToggleHelpModal}>
              {questionCircle}</button>
        </div>

        <div className="pl2 inline-flex items-center">
          <button 
            title="Toggle Theme"
            type="button" 
            /*disabled={isPrioritizing || showingDeleteModal || showingConflictModal || showingSaveModal || showingMoreInfo}*/
            className={`button-reset pa1 w2 h2 pointer f5 fw6 grow bg-transparent bn ${theme === 'light' ? 'gray' : 'gray'}`}
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
                className={`todo-input pa2 w-100 input-reset br3 ba bw1 b--gray ${theme === 'light' ? 'black hover-bg-light-gray active-bg-white' : 'white bg-black hover-bg-dark-gray active-bg-black'}`} 
                type="text" 
                placeholder="Type new task here" 
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
                title="add a task to your list"
                className={`br3 w4 fw6 ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 ${isPrioritizing ? 'o-50' : 'pointer grow'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal} 
                onClick={handleAddTaskUI}>Add Task</button></div>
              
              <div className="ma1 dib"><button type="button"
                title="delete all tasks from your list" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 ${tasks.length !== 0 ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal} 
                onClick={handleToggleDeleteModal}>Delete List</button></div>
            </div>

            <div className="dib">
              <div className="ma1 dib"><button type="button"
                title="start a list prioritizing session" 
                className={`br3 w4 fw6 ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 ${isPrioritizableList(tasks) ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal} 
                onClick={handlePrioritizeUI}>Prioritize List</button></div>
              
              <div className="ma1 dib"><button type="button" 
                title="mark the next actionable item as complete"
                className={`br3 w4 fw6 ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 ${isActionableList(tasks) ? 'pointer grow' : 'o-50'}`} 
                disabled={isPrioritizing || showingDeleteModal || showingMoreInfo || showingConflictModal || showingSaveModal} 
                onClick={handleTakeActionUI}>Mark Done</button></div>
            </div>
          </section>
        </form>
        
        <section className="">
          {/* Note: the true on the next line turns ON cancel/clone buttons */}
          {tasks.length > 0 && renderList(tasks, activeListOffset, true)}
        </section>

        <div className="ph3 pt2 pb3">
          <p className="ma0 o-70 measure-narrow ml-auto mr-auto lh-135">
            {`You have ${tasks.length} item${tasks.length !== 1 ? 's' : ''} in your list.`}
          </p>

          <p className="ma0 o-70 measure-narrow ml-auto mr-auto lh-135 line-clamp-3 overflow-hidden">
            {(benchmarkItem(tasks) !== null) && `The next actionable item is '${benchmarkItem(tasks).text}'.`}
          </p>
        </div>

        {/*prioritization review modal*/}
        {(isPrioritizing && cursor !== -1 && cursor < tasks.length) && 
          <section className={`absolute f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="measure-narrow ml-auto mr-auto">
              <p className="lh-135">{genCurrentQuestion(tasks, cursor)}</p>
              <div className="tc">
                <button 
                  title="quit the prioritization session"
                  className={`br3 w3 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`}
                  onClick={handleQuitUI}>Quit</button>
                <button className={`br3 w3 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`}
                  title="answer no to the question"
                  onClick={handleNoUI}>No</button>
                <button
                  title="answer yes to the question"
                  className={`br3 w3 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`}
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
                <button className={`br3 w4 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`}
                  title="cancel the delete list action"
                  onClick={handleToggleDeleteModal}>No</button>
                <button className={`br3 w4 fw6 grow ba bw1 b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`}
                  title="confirm the delete list action"
                  onClick={handleDeleteUI}>Yes</button>
              </div>
            </section>
          </section>}

          {/*save modal*/}
          {showingSaveModal &&
          <section className={`absolute f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="relative z-1 measure-narrow ml-auto mr-auto tl">

              <h2 className="pb2 ph3 ma0">Import/Export</h2>

              <p className="ph3 ma0 lh-135">{saveInfo1}</p>
              
              <div className="tc">
                <label 
                  title="Upload a JSON file to import tasks"
                  tabIndex="0" 
                  onKeyDown={handleLabelKeyPressForJSONimport}
                  htmlFor="file-upload" 
                  className={`br3 grow dib button-reset border-box w4 f5 fw6 ba bw1 b--gray ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`}>
                <span>Import</span>
                <input id="file-upload" className="dn input-reset"
                    type="file" accept=".json" onChange={handleImportTasks} />
                </label>
                <button
                  title="Export your list to a JSON file"
                  className={`br3 w4 f5 fw6 ba dib bw1 grow b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`}
                  onClick={handleExportTasks}>Export</button>
              </div>

              {importErrMsg && 
                <p className="ph3 pt2 ma0 lh-135 measure ml-auto mr-auto red">{importErrMsg}</p>}
              
              <p className="ph3 pt2 ma0 lh-135">{saveInfo2}</p>

              <div className="ph3 pt1">
                <textarea 
                  className={`db input-reset pa2 w-100 resize-none lh-135 br3 ba bw1 b--gray ${theme === 'light' ? 'black hover-bg-light-gray active-bg-white' : 'white bg-black hover-bg-dark-gray active-bg-black'}`} 
                  rows="2" 
                  value={textAreaValue}
                  onChange={(e) => {
                    setTextAreaValue(e.target.value);
                    setImportErrMsg("");
                  }}
                  placeholder="Paste your list here, with each item on a new line" />
                <button className={`br3 w-100 f5 fw6 ba dib bw1 grow b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer`} onClick={handleTextImport}>Submit</button>
              </div>
              
              <p className="pt2 ph3 pb3 ma0 lh-135">{clickDiskToClose}</p>
            </section>
            <button className="absolute z-0 top-0 left-0 w-100 o-0 h-100" onClick={handleToggleSaveModal} type="button">Close Save Modal</button>
          </section>}

          {/*app info modal*/}
          {showingMoreInfo &&
          <section className={`absolute ph3 f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="relative z-1 measure-narrow ml-auto mr-auto tl">

              <h2 className="pb2 ma0">About AutoFocus</h2>

              <p className="pb3 ma0 lh-135">{infoString1}</p>

              <p className="pb3 ma0 lh-135">{infoString2}</p>

              <p className="pb3 ma0 lh-135">{clickIcircleToClose}</p>
            </section>
            <button className="absolute z-0 top-0 left-0 w-100 o-0 h-100" onClick={handleToggleInfoModal} type="button">Close Info Modal</button>
          </section>}

          {/*help modal*/}
          {showingHelpModal && 
            <section className={`absolute ph3 f5 top-0 w-100 h-100 ${theme === 'light' ? 'bg-white-90' : 'bg-black-90'}`}>
            <section className="relative z-1 measure-narrow ml-auto mr-auto tl">
              <h2 className="pb2 ma0">Instructions & Help</h2>
              <p className="pb2 ma0 lh-135">{instructions}</p>
              <p className="pb2 ma0 lh-135">{instructions2}</p>

              {/*TODO: implement keyboard shortcuts for prioritization review*/}
              {/*<p className="fw6 pb2 ma0 lh-135">Keyboard shortcuts:</p>
              <ul className="ma0 pl3">
                <li className="pb1">Add Task: <span className="fw6">Enter</span></li>
                <li className="pb1">Prioritize List: <span className="fw6">p</span></li>
                <li className="pb1">Mark Done: <span className="fw6">d</span></li>
                <li className="pb1">Delete List: <span className="fw6">x</span></li>
                <li className="pb1">Quit Prioritization: <span className="fw6">q</span></li>
                <li className="pb1">Answer No: <span className="fw6">n</span></li>
                <li className="pb1">Answer Yes: <span className="fw6">y</span></li>
              </ul>*/}

              <p className="pb3 ma0 lh-135">
                <span>{howToReportIssues}</span><a className="link underline blue hover-orange" target="_blank" href="https://github.com/avidrucker/pwa-autofocus-app/issues" rel="noreferrer">AutoFocus Issues</a>
              </p>

              <p className="pb3 ma0 lh-135">{clickQuestionCircleToClose}</p>
            </section>
            <button className="absolute z-0 top-0 left-0 w-100 o-0 h-100" onClick={handleToggleHelpModal} type="button">Close Help Modal</button>
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
            <div className="pb3 tc">
                <button 
                  title="keep the list from the link"
                className={`br3 f5 fw6 ba dib bw1 grow b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`} 
                onClick={() => handleListConflictChoice(deserializeQueryStringToListStateWrapper(window.location.search).result)}>
                  1. Keep <em>link</em> list</button>
              <button
                title="keep the list from local storage"
                className={`br3 f5 fw6 ba dib bw1 grow b--gray button-reset ${theme === 'light' ? 'bg-moon-gray black' : 'bg-dark-gray white'} pa2 pointer ma1`} 
                onClick={() => handleListConflictChoice(initialTasks)}>
                  2. Keep <em>local</em> list</button>
              </div>
            </section>}

      </section>
    </main>
  );
}

export default App;
