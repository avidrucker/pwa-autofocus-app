import React from 'react';

const dotCircle = <svg fill="currentColor" viewBox="0 0 512 512" width="1.25rem" xmlns="http://www.w3.org/2000/svg">
<path d="M256 56c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m0-48C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 168c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z"></path>
</svg>;

const emptyCircle = <svg fill="currentColor" viewBox="0 0 512 512" width="1.25rem" xmlns="http://www.w3.org/2000/svg">
<path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z"></path>
</svg>;

const filledCircle = <svg fill="currentColor" viewBox="0 0 512 512" width="1.25rem" xmlns="http://www.w3.org/2000/svg">
<path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path>
</svg>;

function TodoItem({ task }) {
  return (
    <li className={`flex lh-copy align-start ${task.status === "done"
       && "strike"} ${task.status === "ready" ? 
       "fw6" : "fw4"}`}>
      <span className="mr1">{task.status === "done" ? 
                filledCircle :
                task.status === "ready" ? 
                    dotCircle : emptyCircle}</span>
      <span className="">{task.text}</span>
    </li>
  );
}

export default TodoItem;
