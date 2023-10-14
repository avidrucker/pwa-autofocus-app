// tasksManager.js
export const addTask = (tasks, text) => {
  return [...tasks, { id: Date.now(), text, done: false }];
};

export const toggleTaskDone = (tasks, taskId) => {
  return tasks.map(task =>
    task.id === taskId ? { ...task, done: !task.done } : task
  );
};

export const deleteTask = (tasks, taskId) => {
  return tasks.filter(task => task.id !== taskId);
};