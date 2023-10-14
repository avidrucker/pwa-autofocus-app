import React from 'react';

function TodoItem({ task, onToggleDone, onDelete }) {
  return (
    <li style={{textDecoration: task.done === true && "line-through"}}>
      <span>{task.text}</span>
      <button onClick={onToggleDone}>Done</button>
      <button onClick={onDelete}>Delete</button>
    </li>
  );
}

export default TodoItem;
