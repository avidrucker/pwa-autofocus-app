import { hasNew, hasReady } from './taskUtils';

describe('hasNew', () => {
    test('should return false for empty list', () => {
        const tasks = [];
        const result = hasNew(tasks);
        expect(result).toBe(false);
    });
    
    test('should return false for list with no new items', () => {
        const tasks = [{ id: 0, text: 'task1', status: "ready" }];
        const result = hasNew(tasks);
        expect(result).toBe(false);
    });
    
    test('should return true for list with new items', () => {
        const tasks = [{ id: 0, text: 'task1', status: "new" }];
        const result = hasNew(tasks);
        expect(result).toBe(true);
    });
});

describe('hasReady', () => {
    test('should return false for empty list', () => {
        const tasks = [];
        const result = hasReady(tasks);
        expect(result).toBe(false);
    });
    
    test('should return false for list with no ready items', () => {
        const tasks = [{ id: 0, text: 'task1', status: "new" }];
        const result = hasReady(tasks);
        expect(result).toBe(false);
    });
    
    test('should return true for list with ready items', () => {
        const tasks = [{ id: 0, text: 'task1', status: "ready" }];
        const result = hasReady(tasks);
        expect(result).toBe(true);
    });
});