export const hasNew = (tasks) => 
  tasks.filter(x => x.status === "new").length > 0;

export const hasReady = (tasks) =>
  tasks.filter(x => x.status === "ready").length > 0;