import { hasReady, hasNew } from './taskUtils';

const questionString = (benchmarkItemText, cursorItemText) =>
    `In this moment, are you more ready to '${cursorItemText}' than '${benchmarkItemText}'?`;
  
export const genQuestion = (tasks, cursor) => {
    if(cursor === -1 || cursor >= tasks.length) {
        return "Review question cannot be generated because there is no valid cursor.";
    }
    
    const cursorItem = tasks[cursor];
    const benchmarkItem = tasks.filter(x => x.status === "ready").at(-1);

    if (!benchmarkItem) {
        return "Review question cannot be generated because there is no benchmark item to compare against.";
    }

    return questionString(benchmarkItem.text, cursorItem.text);
};

// a prioritizable list has at least one ready item and 
// at least one new item after the last ready item
export const isPrioritizableList = (tasks) => {
    if (tasks.length <= 1) return false;
    if (!hasReady(tasks) || !hasNew(tasks)) return false;

    const lastReadyItem = tasks.filter(x => x.status === "ready").at(-1);
    const lastNewItem = tasks.filter(x => x.status === "new").at(-1);

    return lastNewItem.id > lastReadyItem.id;
  }

// the initial prioritization session cursor starts at the first new item after the benchmark item
export const getInitialCursor = (tasks) => {
    const lastReadyItem = tasks.filter(x => x.status === "ready").at(-1);
    const lastReadyIndex = tasks.indexOf(lastReadyItem);
    const slicedList = tasks.slice(lastReadyIndex);
    const firstNewItem = slicedList.filter(x => x.status === "new").at(0);
    const firstNewAfterReadyIndex = tasks.indexOf(firstNewItem);
    return firstNewAfterReadyIndex;
};

// first new item after the cursor
export const nextCursor = (tasks, currentCursor) => {
    const slicedList = tasks.slice(currentCursor);
    const firstNewItem = slicedList.filter(x => x.status === "new").at(0);
    if(firstNewItem) {
      return tasks.indexOf(firstNewItem);
    } else {
      return -1; // indicates secondNewItem not found
    }
};

export const markReadyAtIndex = (tasks, cursor) => {
    const updatedTasks = tasks.map((task, index) => 
      index === cursor ? { ...task, status: "ready" } : task
    );
    return updatedTasks;
  };

export const startReview = (tasks) => {
    // check is task list prioritizable
    if (!isPrioritizableList(tasks)) {
        return { error: "The list isn't prioritizable right now." };
    }

    // get initial cursor position
    const initialCursor = getInitialCursor(tasks);
    return { cursor: initialCursor };
};

export const handleReviewDecision = (tasks, cursor, decision) => {
    let updatedTasks = tasks;
    let newCursor = cursor;

    // handle user's decision
    if (decision === 'Yes') {
        updatedTasks = markReadyAtIndex(tasks, cursor);
        newCursor = nextCursor(tasks, cursor + 1);
    } else if (decision === 'No') {
        newCursor = nextCursor(tasks, cursor + 1);
    } else {
        // quit reviewing
        newCursor = -1;
    }

    // Check if review process should end
    if (newCursor === -1 || newCursor === tasks.length) {
        return { tasks: updatedTasks, cursor: newCursor, endReview: true };
    } else {
        return { tasks: updatedTasks, cursor: newCursor };
    }
};
