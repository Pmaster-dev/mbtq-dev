/**
 * Unit tests for Fibonrose Task Validation System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FibonroseValidator, FibonroseTask } from './fibonrose-validator';

describe('FibonroseValidator', () => {
  describe('getRequiredConfirmations', () => {
    it('should return correct Fibonacci values for complexity levels', () => {
      expect(FibonroseValidator.getRequiredConfirmations(0)).toBe(1);
      expect(FibonroseValidator.getRequiredConfirmations(1)).toBe(1);
      expect(FibonroseValidator.getRequiredConfirmations(2)).toBe(2);
      expect(FibonroseValidator.getRequiredConfirmations(3)).toBe(3);
      expect(FibonroseValidator.getRequiredConfirmations(4)).toBe(5);
      expect(FibonroseValidator.getRequiredConfirmations(5)).toBe(8);
      expect(FibonroseValidator.getRequiredConfirmations(6)).toBe(13);
      expect(FibonroseValidator.getRequiredConfirmations(7)).toBe(21);
      expect(FibonroseValidator.getRequiredConfirmations(8)).toBe(34);
      expect(FibonroseValidator.getRequiredConfirmations(9)).toBe(55);
    });

    it('should cap at maximum Fibonacci value for high complexity', () => {
      expect(FibonroseValidator.getRequiredConfirmations(10)).toBe(55);
      expect(FibonroseValidator.getRequiredConfirmations(100)).toBe(55);
    });
  });

  describe('createTask', () => {
    it('should create a task with correct default complexity', () => {
      const task = FibonroseValidator.createTask(
        'Test Task',
        'Test Description'
      );

      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.sequenceLevel).toBe(2);
      expect(task.requiredConfirmations).toBe(2);
      expect(task.actualConfirmations).toBe(0);
      expect(task.status).toBe('pending');
      expect(task.milestones).toHaveLength(2);
    });

    it('should create a task with specified complexity', () => {
      const task = FibonroseValidator.createTask(
        'Complex Task',
        'Complex Description',
        5
      );

      expect(task.sequenceLevel).toBe(5);
      expect(task.requiredConfirmations).toBe(8);
      expect(task.milestones).toHaveLength(8);
    });

    it('should generate unique IDs for tasks', () => {
      const task1 = FibonroseValidator.createTask('Task 1', 'Description 1');
      const task2 = FibonroseValidator.createTask('Task 2', 'Description 2');

      expect(task1.id).not.toBe(task2.id);
    });

    it('should create milestones with correct order', () => {
      const task = FibonroseValidator.createTask(
        'Test Task',
        'Test Description',
        3
      );

      task.milestones.forEach((milestone, index) => {
        expect(milestone.order).toBe(index + 1);
        expect(milestone.confirmed).toBe(false);
        expect(milestone.confirmedAt).toBeUndefined();
        expect(milestone.evidence).toBeUndefined();
      });
    });
  });

  describe('confirmMilestone', () => {
    let task: FibonroseTask;

    beforeEach(() => {
      task = FibonroseValidator.createTask(
        'Test Task',
        'Test Description',
        2
      );
    });

    it('should confirm a milestone with evidence', () => {
      const updatedTask = FibonroseValidator.confirmMilestone(
        task,
        1,
        'commit abc123'
      );

      expect(updatedTask.milestones[0].confirmed).toBe(true);
      expect(updatedTask.milestones[0].evidence).toBe('commit abc123');
      expect(updatedTask.milestones[0].confirmedAt).toBeInstanceOf(Date);
      expect(updatedTask.actualConfirmations).toBe(1);
    });

    it('should update task status to confirming', () => {
      const updatedTask = FibonroseValidator.confirmMilestone(
        task,
        1,
        'evidence'
      );

      expect(updatedTask.status).toBe('confirming');
    });

    it('should update task status to completed when all milestones confirmed', () => {
      let updatedTask = FibonroseValidator.confirmMilestone(
        task,
        1,
        'evidence 1'
      );
      updatedTask = FibonroseValidator.confirmMilestone(
        updatedTask,
        2,
        'evidence 2'
      );

      expect(updatedTask.status).toBe('completed');
      expect(updatedTask.completedAt).toBeInstanceOf(Date);
      expect(updatedTask.actualConfirmations).toBe(2);
    });

    it('should throw error for non-existent milestone', () => {
      expect(() => {
        FibonroseValidator.confirmMilestone(task, 999, 'evidence');
      }).toThrow('Milestone 999 not found');
    });

    it('should throw error when confirming already confirmed milestone', () => {
      FibonroseValidator.confirmMilestone(task, 1, 'evidence');

      expect(() => {
        FibonroseValidator.confirmMilestone(task, 1, 'evidence again');
      }).toThrow('Milestone 1 already confirmed');
    });

    it('should allow confirmation without evidence', () => {
      const updatedTask = FibonroseValidator.confirmMilestone(task, 1);

      expect(updatedTask.milestones[0].confirmed).toBe(true);
      expect(updatedTask.milestones[0].evidence).toBeUndefined();
    });
  });

  describe('getCompletionPercentage', () => {
    it('should return 0 for no confirmations', () => {
      const task = FibonroseValidator.createTask('Test', 'Test', 2);
      expect(FibonroseValidator.getCompletionPercentage(task)).toBe(0);
    });

    it('should return 50 for half confirmed', () => {
      let task = FibonroseValidator.createTask('Test', 'Test', 2);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence');
      expect(FibonroseValidator.getCompletionPercentage(task)).toBe(50);
    });

    it('should return 100 for all confirmed', () => {
      let task = FibonroseValidator.createTask('Test', 'Test', 2);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence 1');
      task = FibonroseValidator.confirmMilestone(task, 2, 'evidence 2');
      expect(FibonroseValidator.getCompletionPercentage(task)).toBe(100);
    });

    it('should round percentage correctly', () => {
      let task = FibonroseValidator.createTask('Test', 'Test', 3);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence');
      // 1/3 = 33.333... should round to 33
      expect(FibonroseValidator.getCompletionPercentage(task)).toBe(33);
    });
  });

  describe('isTaskComplete', () => {
    it('should return false for incomplete task', () => {
      const task = FibonroseValidator.createTask('Test', 'Test', 2);
      expect(FibonroseValidator.isTaskComplete(task)).toBe(false);
    });

    it('should return false if not all milestones confirmed', () => {
      let task = FibonroseValidator.createTask('Test', 'Test', 2);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence');
      expect(FibonroseValidator.isTaskComplete(task)).toBe(false);
    });

    it('should return false if milestones confirmed without evidence', () => {
      let task = FibonroseValidator.createTask('Test', 'Test', 2);
      task = FibonroseValidator.confirmMilestone(task, 1);
      task = FibonroseValidator.confirmMilestone(task, 2);
      expect(FibonroseValidator.isTaskComplete(task)).toBe(false);
    });

    it('should return true when all milestones confirmed with evidence', () => {
      let task = FibonroseValidator.createTask('Test', 'Test', 2);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence 1');
      task = FibonroseValidator.confirmMilestone(task, 2, 'evidence 2');
      expect(FibonroseValidator.isTaskComplete(task)).toBe(true);
    });
  });

  describe('generateProgressReport', () => {
    it('should generate correct report for new task', () => {
      const task = FibonroseValidator.createTask('Test Task', 'Description', 2);
      const report = FibonroseValidator.generateProgressReport(task);

      expect(report).toContain('Test Task');
      expect(report).toContain('PENDING');
      expect(report).toContain('0/2 confirmations (0%)');
      expect(report).toContain('Complexity Level: 2');
      expect(report).toContain('⏳ 1.');
      expect(report).toContain('⏳ 2.');
    });

    it('should generate correct report for partially complete task', () => {
      let task = FibonroseValidator.createTask('Test Task', 'Description', 2);
      task = FibonroseValidator.confirmMilestone(task, 1, 'commit abc123');
      const report = FibonroseValidator.generateProgressReport(task);

      expect(report).toContain('CONFIRMING');
      expect(report).toContain('1/2 confirmations (50%)');
      expect(report).toContain('✅ 1.');
      expect(report).toContain('Evidence: commit abc123');
      expect(report).toContain('⏳ 2.');
    });

    it('should generate correct report for completed task', () => {
      let task = FibonroseValidator.createTask('Test Task', 'Description', 2);
      task = FibonroseValidator.confirmMilestone(task, 1, 'commit abc123');
      task = FibonroseValidator.confirmMilestone(task, 2, 'commit def456');
      const report = FibonroseValidator.generateProgressReport(task);

      expect(report).toContain('COMPLETED');
      expect(report).toContain('2/2 confirmations (100%)');
      expect(report).toContain('✅ 1.');
      expect(report).toContain('✅ 2.');
      expect(report).toContain('Evidence: commit abc123');
      expect(report).toContain('Evidence: commit def456');
    });
  });
});
