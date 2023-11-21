import { addAll, addTask, nextId, completeBenchmarkTask, 
  cancelItem, cloneItem } from './tasksManager';

describe('nextId function', () => {
  test('should return 0 for an empty tasks list', () => {
    const tasks = [];
    const result = nextId(tasks);
    expect(result).toBe(0);
  });

  test('should return 1 for a tasks list with one item having id 0', () => {
    const tasks = [{ id: 0, text: 'task1', status: "ready" }];
    const result = nextId(tasks);
    expect(result).toBe(1);
  });

  test('should return 6 for a tasks list with items having ids 3 and 5', () => {
    const tasks = [
      { id: 3, text: 'task1', status: "ready" },
      { id: 5, text: 'task2', status: "new" }
    ];
    const result = nextId(tasks);
    expect(result).toBe(6);
  });
});

describe('addTask function', () => {
  test('should add task to empty list at ready status', () => {
    const taskText = "New Task";
    let newTasks = [];
    newTasks = addTask(newTasks, taskText);

    expect(newTasks.length).toBe(1);
    expect(newTasks[0].id).toBe(0);
    expect(newTasks[0].text).toBe(taskText);
    expect(newTasks[0].status).toBe("ready");
  });

  test('should add new task to list that already has ready items', () => {
    let newTasks = [];
    newTasks = addTask(newTasks, "a");
    newTasks = addTask(newTasks, "b");

    expect(newTasks.length).toBe(2);
    expect(newTasks[0].status).toBe("ready");
    expect(newTasks[1].status).toBe("new");

  });
});

describe('completeBenchmarkTask function', () => {
  test('should mark the single ready task as done', () => {
    const tasks = [{"id": 0, "text": "a", "status": "ready"}];
    const updatedTasks = completeBenchmarkTask(tasks);
    expect(updatedTasks).toStrictEqual([{"id": 0, "text": "a", "status": "done"}]);
  });

  test('should mark the benchmark task and automark the new item', () => {
    const tasks = [{"id": 0, "text": "a", "status": "done"},
                  {"id": 1, "text": "b", "status": "ready"},
                  {"id": 2, "text": "c", "status": "new"}];
    const updatedTasks = completeBenchmarkTask(tasks);
    expect(updatedTasks).toStrictEqual([{"id": 0, "text": "a", "status": "done"},
                                        {"id": 1, "text": "b", "status": "done"},
                                        {"id": 2, "text": "c", "status": "ready"}]);
  });
});

describe('cancelItem function', () => {
  test('should mark an item as cancelled', () => {
    const tasks = [{ id: 0, text: 'task1', status: "ready" }];
    const result = cancelItem(tasks, 0);
    expect(result.length).toBe(1);
    expect(result[0].status).toBe('cancelled');
    expect(result[0].was).toBe('ready');
  });

  test('should trigger the next automarkable item to get automarked', () => {
    const tasks = [{ id: 0, text: 'task1', status: "ready" },
                   { id: 1, text: 'task2', status: "new" }];
    const result = cancelItem(tasks, 0);
    expect(result.length).toBe(2);
    expect(result[0].status).toBe('cancelled');
    expect(result[0].was).toBe('ready');
    expect(result[1].status).toBe('ready');
  });
});

describe('cloneItem function', () => {
  test('should clone an item and add it to the list', () => {
    const tasks = [{ id: 0, text: 'task1', status: "done" }];
    const result = cloneItem(tasks, 0);
    expect(result.length).toBe(2);
    expect(result[1]).toStrictEqual({ id: 1, text: 'task1', status: "ready"});
  });
});

describe('addAll function', () => {
  test('should add all items from the new list to the old list', () => {
    const initialTasks = [{ id: 0, text: 'task1', status: "done" }];
    const newTasks = [{ id: 1, text: 'task2', status: "ready" },
                      { id: 2, text: 'task3', status: "new" }];
    const result = addAll(initialTasks, newTasks);
    expect(result.length).toBe(3);
    expect(result[0]).toStrictEqual({ id: 0, text: 'task1', status: "done" });
    expect(result[1]).toStrictEqual({ id: 1, text: 'task2', status: "ready" });
    expect(result[2]).toStrictEqual({ id: 2, text: 'task3', status: "new" });
  });
});