// tasksManager.test.js
import { addTask, nextId } from './tasksManager';

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
