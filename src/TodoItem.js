import React from 'react';
import {dotCircle, emptyCircle, filledCircle} from './core/icons'

function TodoItem({ task, isBenchmark }) {
  return (
    <li className={`flex lh-copy align-start ${task.status === "done"
       && "o-50"} ${isBenchmark ? "fw6" : "fw4"}`}>
      <span className="mr1 dib h-15">{task.status === "done" ? 
                filledCircle :
                task.status === "ready" ? 
                    dotCircle : emptyCircle}</span>
      <span className="">{task.text}</span>
    </li>
  );
}

export default TodoItem;
