let tasks = [];

export const addTask = (text) => {
  tasks.push({ text, done: false });
  return tasks;
};

export const toggleTaskDone = (index) => {
  tasks[index].done = !tasks[index].done;
  return tasks;
};

export const deleteTask = (index) => {
  tasks.splice(index, 1);
  return tasks;
};