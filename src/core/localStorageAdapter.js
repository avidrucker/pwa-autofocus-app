/**
 * Save data to local storage under the specified key.
 * @param {string} key - The key under which the data should be stored.
 * @param {any} data - The data to be stored.
 */
export const saveToLocalStorage = (key, data) => {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
    } catch (error) {
        console.error("Failed to save data to local storage:", error);
    }
};

/**
 * Retrieve data from local storage for the given key.
 * @param {string} key - The key for which data should be retrieved.
 * @param {any} defaultValue - The default value to return if the key doesn't exist.
 * @returns {any} - The retrieved data or the default value.
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
    try {
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
            return defaultValue;
        }
        return JSON.parse(serializedData);
    } catch (error) {
        console.error("Failed to retrieve data from local storage:", error);
        return defaultValue;
    }
};
