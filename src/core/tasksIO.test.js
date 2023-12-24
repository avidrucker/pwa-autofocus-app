import { exportTasksToJSON, importTasksFromJSON, 
    importTasksFromString } from './tasksIO';

describe('tasksIO', () => {

    // test importTasksFromString
    describe('importTasksFromString function', () => {
      test('should convert 2 text lines into list of 2 tasks', () => {
        const tasks = importTasksFromString([], "task 1\ntask 2");
        expect(tasks.length).toBe(2);
      });

      test('should correctly ignore empty lines', () => {
        const tasks = importTasksFromString([], "task 1\n\ntask 2");
        expect(tasks.length).toBe(2);
      });

      test('should take empty input and return empty list', () => {
        const tasks = importTasksFromString([], "");
        expect(tasks.length).toBe(0);
      });
    });

    // test exportTasksToJSON
    describe('exportTasksToJSON function', () => {
      test('should convert 2 tasks into JSON string', () => {
        const tasks = [
            { id: 1, text: "task 1" },
            { id: 2, text: "task 2" }
        ];
        const jsonString = exportTasksToJSON(tasks);
        expect(jsonString).toBe('[{"id":1,"text":"task 1"},{"id":2,"text":"task 2"}]');
      });

      test('should take empty input and return empty list', () => {
        const jsonString = exportTasksToJSON([]);
        expect(jsonString).toBe('[]');
      });
    });

    // test importTasksFromJSON
    describe('importTasksFromJSON function', () => {
      let error;

      beforeEach(() => {
        error = jest.spyOn(console, 'error').mockImplementation(() => {});
      });
    
      afterEach(() => {
        error.mockRestore();
      });

      test('should convert JSON string into 2 tasks', () => {
        const jsonString = '[{"id":1,"text":"task 1"},{"id":2,"text":"task 2"}]';
        const tasks = importTasksFromJSON(jsonString);
        expect(tasks.length).toBe(2);
      });

      test('should take empty input and return empty list', () => {
        const tasks = importTasksFromJSON('[]');
        expect(tasks.length).toBe(0);
      });

      test('should throw error if JSON is not an array', () => {
        const jsonString = '{"id":1,"text":"task 1"}';
        const result = importTasksFromJSON(jsonString);
        expect(result).toBe(null);
        expect(console.error).toHaveBeenCalled();
      });

      test('should throw error if JSON is not an array of objects', () => {
        const jsonString = '[{"id":1,"text":"task 1"}, 2]';
        // expect(() => importTasksFromJSON(jsonString)).toThrow();
        const result = importTasksFromJSON(jsonString);
        expect(result).toBe(null);
        expect(console.error).toHaveBeenCalled();
      });

      test('should throw error if JSON is not an array of objects with id and text properties', () => {
        const jsonString = '[{"id":1,"text":"task 1"}, {"id":2}]';
        // expect(() => importTasksFromJSON(jsonString)).toThrow();
        const result = importTasksFromJSON(jsonString);
        expect(result).toBe(null);
        expect(console.error).toHaveBeenCalled();
      });

      test('should throw error if JSON is not an array of objects with id and text properties of correct types', () => {
        const jsonString = '[{"id":1,"text":"task 1"}, {"id":"2","text":3}]';
        // expect(() => importTasksFromJSON(jsonString)).toThrow();
        const result = importTasksFromJSON(jsonString);
        expect(result).toBe(null);
        expect(console.error).toHaveBeenCalled();
      });
    });
});