import React from 'react';
import {dotCircle, emptyCircle, filledCircle, checkmark, duplicateCube,
  deleteX, repeatArrow} from './core/icons'

// converts the all possible statuses *except* for 
// 'cancelled' to a renderable symbol
const statusToSymbol = status => {
  if (status === "done") return filledCircle;
  if (status === "ready") return dotCircle;
  if (status === "new") return emptyCircle;
  return null;
}

function TodoItem({ task, isBenchmark, cancelFunc, cloneFunc, deleteFunc, redoFunc, theme }) {
  return (
    <li className={`flex justify-center lh-135 align-start mb1 ${
      (task.status === "done" || task.status === "cancelled") && "o-50"} ${
        isBenchmark ? "fw6" : "fw4"}`}>
      <span title={task.status} className="mr1 dib h-15">
        {(statusToSymbol(task.status) !== null) ?
          statusToSymbol(task.status) :
          statusToSymbol(task.was)}</span>
      <span className={`measure-narrow ${task.status === "cancelled" && "strike"}`} style={{width: '20em'}}>{task.text}</span>
      <div className="relative h-15 w3 flex">
        {cancelFunc && cloneFunc &&
        <>
          {task.status === "new" || task.status === "ready" ?
            <button 
              title="Complete Task" 
              onClick={cancelFunc} 
              className={`button-reset pa1 hover-button w2 h-15 pointer bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}>
                {checkmark}</button> : 
            <>
            <button 
            title="Redo Task" 
            onClick={redoFunc} 
            className={`button-reset pa1 hover-button w2 h-15 pointer bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}>
              {repeatArrow}</button>
            </>}
          
            <button 
            title="Clone Task" 
            onClick={cloneFunc} 
            className={`button-reset pa1 hover-button w2 h-15 pointer bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}>
              {duplicateCube}</button>
        </>}
        <button 
          title="Delete Task" 
          onClick={deleteFunc} 
          className={`button-reset pa1 hover-button w2 h-15 pointer bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}>
            {deleteX}</button>
      </div>
    </li>
  );
}

export default TodoItem;
