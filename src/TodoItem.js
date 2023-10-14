import React from 'react';

function TodoItem({ task, onToggleDone, onDelete }) {
  return (
    <div>
      <span>{task.text}</span>
      <button onClick={onToggleDone}>Done</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}

export default TodoItem;
