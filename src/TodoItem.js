import React from 'react';

function TodoItem({ task }) {
  return (
    <li className={`${task.status === "done"
       && "strike"} ${task.status === "ready" ? 
       "fw6" : "fw4"}`}>
      <span>{task.text}</span>
    </li>
  );
}

export default TodoItem;
