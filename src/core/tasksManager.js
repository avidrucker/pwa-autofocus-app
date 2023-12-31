import { hasReady, hasNew } from './taskUtils';

// TODO: make consistent across project to use either 
// 'task' or 'item' term, but not both (domain language)

export const nextId = (tasks) => {
  return tasks.length === 0 ? 
    0 : 
    Math.max(...tasks.map(x => x.id)) + 1;
}

// the benchmark item, also called the priority item, 
// is the last ready item in a list (domain language)
export const benchmarkItem = (tasks) => {
  if(!hasReady(tasks)) return null;

  return tasks.filter(x => x.status === "ready").at(-1);
};

// An automarkable list has new items and has no ready items. 
const isAutoMarkableList = (tasks) => {
  return hasNew(tasks) && !hasReady(tasks);
};

// marks the first new item if the list is automarkable
const automark = (tasks) => {
  if(!isAutoMarkableList) {
    return tasks;
  }
  const firstNewItem = tasks.filter(x => x.status === "new").at(0);
  const updatedTasks = tasks.map(task =>
    task.id === firstNewItem.id ? { ...task, status: "ready" } : task);
  return updatedTasks;
};

// actionable lists have at least 1 ready status item
export const isActionableList = (tasks) => {
  return hasReady(tasks);
};

export const completeBenchmarkTask = (tasks) => {
  if(!isActionableList(tasks)) {
    return tasks;
  }
  // get last ready item's id
  const benchmarkItem = tasks.filter(x => x.status === "ready").at(-1);
  // mark that item's status as done
  const updatedTasks = tasks.map(task =>
    task.id === benchmarkItem.id ? { ...task, status: "done" } : task);
  // if new list is automarkable, automark & then return, else return new list as-is 
  return isAutoMarkableList(updatedTasks) ? automark(updatedTasks) : updatedTasks;
};

// newly added tasks have status of new unless no ready items exist, then they have a status of ready
export const addTask = (tasks, text) =>
  [...tasks, 
    { id: nextId(tasks), text, status: hasReady(tasks) ? "new" : "ready" }];

export const emptyList = () => [];

export const addAll = (initialTasks, newTasks) => {
  const maxId = initialTasks.reduce((max, task) => Math.max(max, task.id), -1);
  const updatedNewTasks = newTasks.map((task, index) => ({
    id: maxId + index + 1, // Assign new IDs starting from maxId + 1
    text: task.text,
    status: task.status,
  }));

  return [...initialTasks, ...updatedNewTasks];
};

// TODO: test this function, confirm that it works as expected
export const cancelItem = (tasks, id) => {
  const updatedTasks = tasks.map(task => 
    task.id === id ? { ...task, was: task.status, status: "cancelled" } : task
  );
  return isAutoMarkableList(updatedTasks) ? automark(updatedTasks) : updatedTasks;
}

// takes item of a given id and re-adds it to the list
export const cloneItem = (tasks, id) => {
  const itemText = tasks.filter(x => x.id === id).at(0).text;
  const updatedTasks = addTask(tasks, itemText);
  return updatedTasks;
}