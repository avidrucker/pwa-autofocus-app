import React from 'react';
import {dotCircle, emptyCircle, filledCircle, 
  cancelX, repeatArrow} from './core/icons'

// converts the all possible statuses *except* for 
// 'cancelled' to a renderable symbol
const statusToSymbol = status => {
  if (status === "done") return filledCircle;
  if (status === "ready") return dotCircle;
  if (status === "new") return emptyCircle;
  return null;
}

function TodoItem({ task, isBenchmark, cancelFunc, cloneFunc, theme }) {
  return (
    <li className={`flex lh-135 align-start mb1 ${
      (task.status === "done" || task.status === "cancelled") && "o-50"} ${
        isBenchmark ? "fw6" : "fw4"}`}>
      <span title={task.status} className="mr1 dib h-15">
        {(statusToSymbol(task.status) !== null) ?
          statusToSymbol(task.status) :
          statusToSymbol(task.was)}</span>
      <span className={`${task.status === "cancelled" && "strike"}`}>{task.text}</span>
      <div className="relative ml1 h-15 w3">
        {cancelFunc && cloneFunc &&
        <>
      {task.status === "new" || task.status === "ready" ?
        <button 
          title="Cancel Task" 
          onClick={cancelFunc} 
          className={`button-reset pa1 hover-button w2 h-15 pointer bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}>
            {cancelX}</button> : 
        <button 
          title="Clone Task" 
          onClick={cloneFunc} 
          className={`button-reset pa1 hover-button w2 h-15 pointer bg-transparent bn ${theme === 'light' ? 'moon-gray' : 'mid-gray'}`}>
            {repeatArrow}</button>}</>}
        </div>
    </li>
  );
}

export default TodoItem;
