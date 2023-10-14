// tasksManager.test.js
import { addTask, toggleTaskDone, deleteTask, resetTasks } from './tasksManager';

beforeEach(() => {
    resetTasks();  // Reset the tasks before each test
  });

test('should add a task', () => {
  const taskText = "New Task";
  let newTasks = [];
  newTasks = addTask(taskText);

  expect(newTasks.length).toBe(1);
  expect(newTasks[0].text).toBe(taskText);
  expect(newTasks[0].done).toBe(false);
});

test('should toggle task completion status', () => {
    let newTasks = [];
    const taskText = "Sample Task";
    newTasks = addTask(taskText);  // Setup: Add a task first
    newTasks = toggleTaskDone(0);  // Toggle the task's status
    
    // Assertions
    expect(newTasks[0].done).toBe(true);  // Task should be marked as done
    newTasks = toggleTaskDone(0);  // Toggle the task's status again
    
    // Assertions
    expect(newTasks[0].done).toBe(false);  // Task should be marked as not done
});
  
  test('should delete a task', () => {
    let newTasks = [];
    const taskText1 = "Task 1";
    const taskText2 = "Task 2";
    
    newTasks = addTask(taskText1);  // Setup: Add first task
    newTasks = addTask(taskText2);  // Setup: Add second task
    
    newTasks = deleteTask(0);  // Delete the first task
    
    // Assertions
    expect(newTasks.length).toBe(1);  // Only one task should remain
    expect(newTasks[0].text).toBe(taskText2);  // The remaining task should be "Task 2"
});
  