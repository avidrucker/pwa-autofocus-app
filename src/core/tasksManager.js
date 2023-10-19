// tasksManager.js
export const nextId = (tasks) => {
  return tasks.length === 0 ? 
    0 : 
    Math.max(...tasks.map(x => x.id)) + 1;
}

export const addTask = (tasks, text) =>
  [...tasks, 
    { id: nextId(tasks), text, status: "new" }];

export const emptyList = () => [];