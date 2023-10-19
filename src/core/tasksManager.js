// tasksManager.js
export const nextId = (tasks) => {
  if(tasks.length === 0) {
    return 0;
  } else {
    return Math.max(...tasks.map(x => x.id)) + 1;
  }
}

export const addTask = (tasks, text) => {
  return [...tasks, { id: nextId(tasks), text, done: false }];
};

export const toggleTaskDone = (tasks, taskId) => {
  return tasks.map(task =>
    task.id === taskId ? { ...task, done: !task.done } : task
  );
};

export const emptyList = () => {
  return [];
};