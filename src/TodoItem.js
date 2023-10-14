import React from 'react';

function TodoItem({ task, onToggleDone, onDelete }) {
  return (
    <div style={{textDecoration: task.done === true && "line-through"}}>
      <span>{task.text}</span>
      <button onClick={onToggleDone}>Done</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}

export default TodoItem;
