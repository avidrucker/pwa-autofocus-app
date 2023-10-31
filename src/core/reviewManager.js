import { isPrioritizableList, getInitialCursor, 
    markReadyAtIndex, nextCursor } from './tasksManager';

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
