// convert tasks list to JSON string
export const exportTasksToJSON = (tasks) => {
    try {
        return JSON.stringify(tasks);
    } catch (error) {
        console.error("Failed to convert tasks to JSON:", error);
        return null;
    }
};

// parse JSON string and return tasks list
export const importTasksFromJSON = (jsonString) => {
    try {
        const tasks = JSON.parse(jsonString);
        
        if (!Array.isArray(tasks)) {
            throw new Error("The JSON content isn't an array.");
        }
        
        for (let task of tasks) {
            if (typeof task !== 'object') {
                throw new Error("A task in the JSON isn't an object.");
            }
            if (!task.hasOwnProperty('id')) {
                throw new Error("A task in the JSON doesn't have an 'id' property.");
            }
            if (typeof task.id !== 'number') {
                throw new Error("The 'id' property in a task isn't a number.");
            }
            if (!task.hasOwnProperty('text')) {
                throw new Error("A task in the JSON doesn't have a 'text' property.");
            }
            if (typeof task.text !== 'string') {
                throw new Error("The 'text' property in a task isn't a string.");
            }
        }
        
        return tasks;

    } catch (error) {
        console.error("Failed to parse JSON to tasks:", error);
        return null;
    }
};
