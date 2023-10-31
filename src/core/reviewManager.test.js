import { startReview, handleReviewDecision } from './reviewManager';
import { isPrioritizableList, getInitialCursor, markReadyAtIndex, nextCursor } from './tasksManager';

// Mocking the dependencies from tasksManager.js
jest.mock('./tasksManager');

describe('reviewManager', () => {

    describe('startReview', () => {
        it('should return error if list is not prioritizable', () => {
            isPrioritizableList.mockReturnValue(false);
            const result = startReview([]);
            expect(result).toEqual({ error: "The list isn't prioritizable right now." });
        });

        it('should return initial cursor if list is prioritizable', () => {
            isPrioritizableList.mockReturnValue(true);
            getInitialCursor.mockReturnValue(0);
            const result = startReview(['task1', 'task2']);
            expect(result).toEqual({ cursor: 0 });
        });
    });

    describe('handleReviewDecision', () => {
        const mockTasks = ['task1', 'task2', 'task3'];

        it('should handle "Yes" decision and return updated tasks and next cursor', () => {
            markReadyAtIndex.mockReturnValue(['task1', 'task2-ready', 'task3']);
            nextCursor.mockReturnValue(2);
            const result = handleReviewDecision(mockTasks, 1, 'Yes');
            expect(result).toEqual({ tasks: ['task1', 'task2-ready', 'task3'], cursor: 2 });
        });

        it('should handle "No" decision and return next cursor', () => {
            nextCursor.mockReturnValue(2);
            const result = handleReviewDecision(mockTasks, 1, 'No');
            expect(result).toEqual({ tasks: mockTasks, cursor: 2 });
        });

        it('should handle quitting the review', () => {
            const result = handleReviewDecision(mockTasks, 1, 'Quit');
            expect(result).toEqual({ tasks: mockTasks, cursor: -1, endReview: true });
        });
    });

});
