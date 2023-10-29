// tasksManager.js
export const nextId = (tasks) => {
  return tasks.length === 0 ? 
    0 : 
    Math.max(...tasks.map(x => x.id)) + 1;
}

const hasNew = (tasks) => 
  tasks.filter(x => x.status === "new").length > 0;
  

const hasReady = (tasks) =>
  tasks.filter(x => x.status === "ready").length > 0;

// the benchmark item, also called the priority item, 
// is the last ready item in a list
export const benchmarkItem = (tasks) => {
  if(!hasReady(tasks)) return null;

  return tasks.filter(x => x.status === "ready").at(-1);
}

// An automarkable list has new items and has no ready items. 
const isAutoMarkableList = (tasks) => {
  return hasNew(tasks) && !hasReady(tasks);
}

// marks the first new item
const automark = (tasks) => {
  if(!isAutoMarkableList) {
    return tasks;
  }
  const firstNewItem = tasks.filter(x => x.status === "new").at(0);
  const updatedTasks = tasks.map(task =>
    task.id === firstNewItem.id ? { ...task, status: "ready" } : task);
  return updatedTasks;
}

// actionable lists have at least 1 ready status item
export const isActionableList = (tasks) => {
  return hasReady(tasks);
}

// a prioritizable list has at least one ready item and at least one new item after the last ready item
export const isPrioritizableList = (tasks) => {
  if(tasks.length === 0 || tasks.length === 1)
    return false;
  if(!hasReady(tasks))
    return false;
  if(!hasNew(tasks))
    return false;
  const lastReadyItem = tasks.filter(x => x.status === "ready").at(-1);
  const lastNewItem = tasks.filter(x => x.status === "new").at(-1);
  return lastNewItem.id > lastReadyItem.id;
}

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
}

// newly added tasks have status of new unless no ready items exist, then they have a status of ready
export const addTask = (tasks, text) =>
  [...tasks, 
    { id: nextId(tasks), text, status: hasReady(tasks) ? "new" : "ready" }];

export const emptyList = () => [];

// the initial prioritization session cursor starts at the first new item after the benchmark item
export const getInitialCursor = (tasks) => {
  const lastReadyItem = tasks.filter(x => x.status === "ready").at(-1);
  const lastReadyIndex = tasks.indexOf(lastReadyItem);
  const slicedList = tasks.slice(lastReadyIndex);
  const firstNewItem = slicedList.filter(x => x.status === "new").at(0);
  const firstNewAfterReadyIndex = tasks.indexOf(firstNewItem);
  return firstNewAfterReadyIndex;
}

// first new item after the cursor
export const nextCursor = (tasks, currentCursor) => {
  const slicedList = tasks.slice(currentCursor);
  const firstNewItem = slicedList.filter(x => x.status === "new").at(0);
  if(firstNewItem) {
    return tasks.indexOf(firstNewItem);
  } else {
    return -1; // indicates secondNewItem not found
  }
}

const questionString = (benchmarkItemText, cursorItemText) =>
  `In this moment, are you more ready to '${cursorItemText}' than '${benchmarkItemText}'?`;

export const genQuestion = (tasks, cursor) => {
  const cursorItem = tasks[cursor];
  const benchmarkItem = tasks.filter(x => x.status === "ready").at(-1);
  return questionString(benchmarkItem.text, cursorItem.text);
}

export const markReadyAtIndex = (tasks, cursor) => {
  tasks[cursor].status = "ready";
  return tasks;
}