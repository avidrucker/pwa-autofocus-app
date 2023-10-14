// tasksManager.test.js
import { addTask, toggleTaskDone, deleteTask, nextId } from './tasksManager';

describe('nextId function', () => {
  
  test('should return 0 for an empty tasks list', () => {
    const tasks = [];
    const result = nextId(tasks);
    expect(result).toBe(0);
  });

  test('should return 1 for a tasks list with one item having id 0', () => {
    const tasks = [{ id: 0, text: 'task1', done: false }];
    const result = nextId(tasks);
    expect(result).toBe(1);
  });

  test('should return 6 for a tasks list with items having ids 3 and 5', () => {
    const tasks = [
      { id: 3, text: 'task1', done: false },
      { id: 5, text: 'task2', done: true }
    ];
    const result = nextId(tasks);
    expect(result).toBe(6);
  });

});

describe('addTask function', () => {
  test('should add a task', () => {
    const taskText = "New Task";
    let newTasks = [];
    newTasks = addTask(newTasks, taskText);

    expect(newTasks.length).toBe(1);
    expect(newTasks[0].text).toBe(taskText);
    expect(newTasks[0].done).toBe(false);
  });
});

describe('toggleTaskDone function', () => {
  test('should toggle task completion status', () => {
      let newTasks = [];
      const taskText = "Sample Task";
      newTasks = addTask(newTasks, taskText);  // Setup: Add a task first
      newTasks = toggleTaskDone(newTasks, 0);  // Toggle the task's status
      
      // Assertions
      expect(newTasks[0].done).toBe(true);  // Task should be marked as done
      newTasks = toggleTaskDone(newTasks, 0);  // Toggle the task's status again
      
      // Assertions
      expect(newTasks[0].done).toBe(false);  // Task should be marked as not done
  });
});
  
describe('deleteTask function', () => {
  test('should delete a task', () => {
    let newTasks = [];
    const taskText1 = "Task 1";
    const taskText2 = "Task 2";
    
    newTasks = addTask(newTasks,taskText1);  // Setup: Add first task
    newTasks = addTask(newTasks,taskText2);  // Setup: Add second task
    
    newTasks = deleteTask(newTasks, 0);  // Delete the first task
    
    // Assertions
    expect(newTasks.length).toBe(1);  // Only one task should remain
    expect(newTasks[0].text).toBe(taskText2);  // The remaining task should be "Task 2"
  });
});
  