import { startReview, handleReviewDecision, isPrioritizableList } from './reviewManager';

describe('reviewManager', () => {

    describe('startReview', () => {
        it('should return error if list is not prioritizable', () => {
            const result = startReview([]);
            expect(result).toEqual({ error: "The list isn't prioritizable right now." });
        });

        it('should return initial cursor if list is prioritizable', () => {
            const result = startReview([{id: 0, text: "a", status: "ready"},
            {id: 1, text: "b", status: "new"}]);
            expect(result).toEqual({ cursor: 1 });
        });
    });

    describe('handleReviewDecision', () => {
        const mockTasks = [{id: 0, text: "a", status: "ready"},
            {id: 1, text: "b", status: "new"},
            {id: 2, text: "c", status: "new"}];

        it('should handle "Yes" decision and return updated tasks and next cursor', () => {
            const result = handleReviewDecision(mockTasks, 1, 'Yes');
            expect(result).toEqual({ tasks: [{id: 0, text: "a", status: "ready"},
            {id: 1, text: "b", status: "ready"},
            {id: 2, text: "c", status: "new"}], cursor: 2 });
        });

        it('should handle "No" decision and return next cursor', () => {
            const result = handleReviewDecision(mockTasks, 1, 'No');
            expect(result).toEqual({ tasks: mockTasks, cursor: 2 });
        });

        it('should handle quitting the review', () => {
            const result = handleReviewDecision(mockTasks, 1, 'Quit');
            expect(result).toEqual({ tasks: mockTasks, cursor: -1, endReview: true });
        });
    });

    describe('isPrioritizableList function', () => {
        test('should correctly identify prioritizable list of 2 items', () => {
          const tasks = [{ id: 3, text: 'task1', status: "ready" },
                        { id: 5, text: 'task2', status: "new" }];
          expect(isPrioritizableList(tasks)).toBe(true);
        });
      
        test('should correctly identify priorizable list of 3 items', () => {
          const tasks = [{"id": 0, "text": "a", "status": "done"},
                        {"id": 1, "text": "b", "status": "ready"},
                        {"id": 2, "text": "c", "status": "new"}];
          expect(isPrioritizableList(tasks)).toBe(true);
        });
      
        test('should correctly identify non-priorizable list of 2 items', () => {
          const tasks = [{"id":0,"text":"a","status":"done"},
                        {"id":1,"text":"b","status":"ready"}];
          expect(isPrioritizableList(tasks)).toBe(false);
        });
      
        test('should correctly identify non-priorizable list of 0 items', () => {
          const tasks = [];
          expect(isPrioritizableList(tasks)).toBe(false);
        });
      });

});
