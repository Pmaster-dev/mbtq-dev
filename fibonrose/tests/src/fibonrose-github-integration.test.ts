/**
 * Unit tests for Fibonrose GitHub Integration
 */

import { describe, it, expect } from 'vitest';
import { FibonroseGitHubIntegration } from './fibonrose-github-integration';
import { FibonroseValidator } from './fibonrose-validator';

describe('FibonroseGitHubIntegration', () => {
  describe('generateIssueBody', () => {
    it('should generate issue body with checklist', () => {
      const task = FibonroseValidator.createTask(
        'Implement Feature X',
        'Add new feature with testing',
        3
      );

      const body = FibonroseGitHubIntegration.generateIssueBody(task);

      expect(body).toContain('## Implement Feature X');
      expect(body).toContain('Add new feature with testing');
      expect(body).toContain('🌹 Fibonrose Confirmation Checklist');
      expect(body).toContain('**Complexity Level:** 3');
      expect(body).toContain('**Required Confirmations:** 3');
      expect(body).toContain('- [ ] **Checkpoint 1:**');
      expect(body).toContain('- [ ] **Checkpoint 2:**');
      expect(body).toContain('- [ ] **Checkpoint 3:**');
      expect(body).toContain('📝 Confirmation Instructions');
    });

    it('should include confirmation instructions', () => {
      const task = FibonroseValidator.createTask('Test', 'Test', 2);
      const body = FibonroseGitHubIntegration.generateIssueBody(task);

      expect(body).toContain('Evidence of completion');
      expect(body).toContain('Link to relevant code/documentation');
      expect(body).toContain('Brief explanation');
      expect(body).toContain('Task is only complete when ALL checkpoints are confirmed');
    });

    it('should generate correct number of checkpoints', () => {
      const task = FibonroseValidator.createTask('Test', 'Test', 4);
      const body = FibonroseGitHubIntegration.generateIssueBody(task);

      const checkpointCount = (body.match(/- \[ \] \*\*Checkpoint \d+:/g) || []).length;
      expect(checkpointCount).toBe(5); // Complexity 4 = 5 confirmations
    });
  });

  describe('parseConfirmationComment', () => {
    it('should parse valid confirmation comment', () => {
      const comment = 'Confirm checkpoint 1: commit abc123def456';
      const result = FibonroseGitHubIntegration.parseConfirmationComment(comment);

      expect(result.milestoneOrder).toBe(1);
      expect(result.evidence).toBe('commit abc123def456');
    });

    it('should parse confirmation with colon', () => {
      const comment = 'Confirm checkpoint 2: Implemented feature X';
      const result = FibonroseGitHubIntegration.parseConfirmationComment(comment);

      expect(result.milestoneOrder).toBe(2);
      expect(result.evidence).toBe('Implemented feature X');
    });

    it('should parse confirmation without colon', () => {
      const comment = 'Confirm checkpoint 3 Test results attached';
      const result = FibonroseGitHubIntegration.parseConfirmationComment(comment);

      expect(result.milestoneOrder).toBe(3);
      expect(result.evidence).toBe('Test results attached');
    });

    it('should be case insensitive', () => {
      const comment = 'CONFIRM CHECKPOINT 5: ALL TESTS PASSING';
      const result = FibonroseGitHubIntegration.parseConfirmationComment(comment);

      expect(result.milestoneOrder).toBe(5);
      expect(result.evidence).toBe('ALL TESTS PASSING');
    });

    it('should handle multi-word evidence', () => {
      const comment = 'Confirm checkpoint 1: Created src/components/Feature.tsx with tests';
      const result = FibonroseGitHubIntegration.parseConfirmationComment(comment);

      expect(result.milestoneOrder).toBe(1);
      expect(result.evidence).toBe('Created src/components/Feature.tsx with tests');
    });

    it('should return null for invalid comment', () => {
      const comment = 'This is just a regular comment';
      const result = FibonroseGitHubIntegration.parseConfirmationComment(comment);

      expect(result.milestoneOrder).toBeNull();
      expect(result.evidence).toBeNull();
    });

    it('should return null for malformed confirmation', () => {
      const comment = 'Confirm checkpoint';
      const result = FibonroseGitHubIntegration.parseConfirmationComment(comment);

      expect(result.milestoneOrder).toBeNull();
      expect(result.evidence).toBeNull();
    });

    it('should handle confirmation with URL evidence', () => {
      const comment = 'Confirm checkpoint 2: https://github.com/user/repo/commit/abc123';
      const result = FibonroseGitHubIntegration.parseConfirmationComment(comment);

      expect(result.milestoneOrder).toBe(2);
      expect(result.evidence).toBe('https://github.com/user/repo/commit/abc123');
    });
  });

  describe('generateProgressComment', () => {
    it('should generate progress comment for new task', () => {
      const task = FibonroseValidator.createTask('Test Task', 'Description', 2);
      const comment = FibonroseGitHubIntegration.generateProgressComment(task);

      expect(comment).toContain('📊 Fibonrose Progress Report');
      expect(comment).toContain('Test Task');
      expect(comment).toContain('PENDING');
      expect(comment).toContain('0/2 confirmations (0%)');
      expect(comment).toContain('2 confirmation(s) remaining');
    });

    it('should generate progress comment for partially complete task', () => {
      let task = FibonroseValidator.createTask('Test Task', 'Description', 3);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence 1');
      const comment = FibonroseGitHubIntegration.generateProgressComment(task);

      expect(comment).toContain('CONFIRMING');
      expect(comment).toContain('1/3 confirmations (33%)');
      expect(comment).toContain('2 confirmation(s) remaining');
      expect(comment).toContain('Next checkpoint:');
    });

    it('should generate completion comment when all confirmed', () => {
      let task = FibonroseValidator.createTask('Test Task', 'Description', 2);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence 1');
      task = FibonroseValidator.confirmMilestone(task, 2, 'evidence 2');
      const comment = FibonroseGitHubIntegration.generateProgressComment(task);

      expect(comment).toContain('COMPLETED');
      expect(comment).toContain('2/2 confirmations (100%)');
      expect(comment).toContain('ALL CONFIRMATIONS COMPLETE!');
      expect(comment).toContain('validated through the Fibonrose sequence');
      expect(comment).toContain('Ready to close this issue!');
    });

    it('should identify next unconfirmed checkpoint', () => {
      let task = FibonroseValidator.createTask('Test Task', 'Description', 3);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence 1');
      const comment = FibonroseGitHubIntegration.generateProgressComment(task);

      expect(comment).toContain('Next checkpoint:');
      expect(comment).toContain('Confirmation checkpoint 2/3');
    });

    it('should show remaining confirmations correctly', () => {
      let task = FibonroseValidator.createTask('Test Task', 'Description', 4);
      task = FibonroseValidator.confirmMilestone(task, 1, 'evidence 1');
      task = FibonroseValidator.confirmMilestone(task, 2, 'evidence 2');
      const comment = FibonroseGitHubIntegration.generateProgressComment(task);

      expect(comment).toContain('3 confirmation(s) remaining');
    });
  });
});
