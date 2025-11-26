import { describe, it, expect } from 'vitest';
import { calculateExitCode } from '../lib/exit-code-calculator.js';
import type { ComparisonResult } from '../lib/image-comparer.js';
import type { ScannedFile } from '../lib/file-scanner.js';

describe('exit-code-calculator', () => {
  describe('calculateExitCode', () => {
    it('should return 0 when there are no differences', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'image1.png',
          hasDifference: false,
          diffPercentage: 0,
          diffImagePath: '/output/image1-diff.png',
        },
        {
          name: 'image2.png',
          hasDifference: false,
          diffPercentage: 0,
          diffImagePath: '/output/image2-diff.png',
        },
      ];
      const baselineOnly: ScannedFile[] = [];

      const exitCode = calculateExitCode(comparisonResults, baselineOnly);

      expect(exitCode).toBe(0);
    });

    it('should return 0 when there are only candidate-only files (new screenshots)', () => {
      const comparisonResults: ComparisonResult[] = [];
      const baselineOnly: ScannedFile[] = [];

      const exitCode = calculateExitCode(comparisonResults, baselineOnly);

      expect(exitCode).toBe(0);
    });

    it('should return 0 when there are no diffs and only candidate-only files', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'image1.png',
          hasDifference: false,
          diffPercentage: 0,
          diffImagePath: '/output/image1-diff.png',
        },
      ];
      const baselineOnly: ScannedFile[] = [];

      const exitCode = calculateExitCode(comparisonResults, baselineOnly);

      expect(exitCode).toBe(0);
    });

    it('should return 1 when there are visual differences', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'changed-image.png',
          hasDifference: true,
          diffPercentage: 15.5,
          diffImagePath: '/output/changed-image-diff.png',
        },
      ];
      const baselineOnly: ScannedFile[] = [];

      const exitCode = calculateExitCode(comparisonResults, baselineOnly);

      expect(exitCode).toBe(1);
    });

    it('should return 1 when there are baseline-only files (deleted screenshots)', () => {
      const comparisonResults: ComparisonResult[] = [];
      const baselineOnly: ScannedFile[] = [
        { name: 'deleted-image.png', path: '/baseline/deleted-image.png' },
      ];

      const exitCode = calculateExitCode(comparisonResults, baselineOnly);

      expect(exitCode).toBe(1);
    });

    it('should return 1 when there are both differences and baseline-only files', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'changed-image.png',
          hasDifference: true,
          diffPercentage: 25.0,
          diffImagePath: '/output/changed-image-diff.png',
        },
      ];
      const baselineOnly: ScannedFile[] = [
        { name: 'deleted-image.png', path: '/baseline/deleted-image.png' },
      ];

      const exitCode = calculateExitCode(comparisonResults, baselineOnly);

      expect(exitCode).toBe(1);
    });

    it('should return 1 when there are differences even with candidate-only files', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'changed-image.png',
          hasDifference: true,
          diffPercentage: 10.0,
          diffImagePath: '/output/changed-image-diff.png',
        },
      ];
      const baselineOnly: ScannedFile[] = [];

      const exitCode = calculateExitCode(comparisonResults, baselineOnly);

      expect(exitCode).toBe(1);
    });
  });
});
