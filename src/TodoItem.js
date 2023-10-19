import React from 'react';

function TodoItem({ task }) {
  return (
    <li style={{textDecoration: task.done === true && "line-through"}}>
      <span>{task.text}</span>
    </li>
  );
}

export default TodoItem;
