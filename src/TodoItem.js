import React from 'react';

function TodoItem({ task }) {
  return (
    <li style={{textDecoration: task.status === "done" && "line-through",
                fontWeight: task.status === "ready" ? "900" : "500"}}>
      <span>{task.text}</span>
    </li>
  );
}

export default TodoItem;
