import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateReport } from '../lib/report-generator.js';
import type { ComparisonResult } from '../lib/image-comparer.js';
import type { ScannedFile } from '../lib/file-scanner.js';

describe('report-generator', () => {
  const testDir = join(process.cwd(), 'test-fixtures-report');

  beforeEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('generateReport', () => {
    it('should create index.html file', () => {
      const comparisonResults: ComparisonResult[] = [];
      const baselineOnly: ScannedFile[] = [];
      const candidateOnly: ScannedFile[] = [];

      generateReport(comparisonResults, baselineOnly, candidateOnly, testDir);

      expect(existsSync(join(testDir, 'index.html'))).toBe(true);
    });

    it('should include summary with counts', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'changed.png',
          hasDifference: true,
          diffPercentage: 25.5,
          baselineImagePath: join(testDir, 'changed-baseline.png'),
          candidateImagePath: join(testDir, 'changed-candidate.png'),
          diffImagePath: join(testDir, 'changed-diff.png'),
        },
      ];
      const baselineOnly: ScannedFile[] = [
        { name: 'deleted.png', path: '/baseline/deleted.png' },
      ];
      const candidateOnly: ScannedFile[] = [{ name: 'new.png', path: '/candidate/new.png' }];

      generateReport(comparisonResults, baselineOnly, candidateOnly, testDir);

      const html = readFileSync(join(testDir, 'index.html'), 'utf-8');

      expect(html).toContain('Visual Diff Report');
      expect(html).toMatch(/total.*3/i);
      expect(html).toMatch(/different.*1/i);
      expect(html).toMatch(/removed.*1/i);
      expect(html).toMatch(/added.*1/i);
    });

    it('should show three images side-by-side for differences', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'changed.png',
          hasDifference: true,
          diffPercentage: 15.75,
          baselineImagePath: join(testDir, 'changed-baseline.png'),
          candidateImagePath: join(testDir, 'changed-candidate.png'),
          diffImagePath: join(testDir, 'changed-diff.png'),
        },
      ];
      const baselineOnly: ScannedFile[] = [];
      const candidateOnly: ScannedFile[] = [];

      generateReport(comparisonResults, baselineOnly, candidateOnly, testDir);

      const html = readFileSync(join(testDir, 'index.html'), 'utf-8');

      // Should reference all three images
      expect(html).toContain('changed-baseline.png');
      expect(html).toContain('changed-candidate.png');
      expect(html).toContain('changed-diff.png');
      expect(html).toContain('15.75');
    });

    it('should handle dimension mismatch display', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'mismatched.png',
          hasDifference: true,
          diffPercentage: 100,
          baselineImagePath: join(testDir, 'mismatched-baseline.png'),
          candidateImagePath: join(testDir, 'mismatched-candidate.png'),
          diffImagePath: join(testDir, 'mismatched-diff.png'),
          dimensionMismatch: { baseline: '10x20', candidate: '20x30' },
        },
      ];
      const baselineOnly: ScannedFile[] = [];
      const candidateOnly: ScannedFile[] = [];

      generateReport(comparisonResults, baselineOnly, candidateOnly, testDir);

      const html = readFileSync(join(testDir, 'index.html'), 'utf-8');

      expect(html).toContain('Dimension mismatch');
      expect(html).toContain('10x20');
      expect(html).toContain('20x30');
    });

    it('should show status indicator', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'changed.png',
          hasDifference: true,
          diffPercentage: 15.75,
          baselineImagePath: join(testDir, 'changed-baseline.png'),
          candidateImagePath: join(testDir, 'changed-candidate.png'),
          diffImagePath: join(testDir, 'changed-diff.png'),
        },
      ];
      const baselineOnly: ScannedFile[] = [];
      const candidateOnly: ScannedFile[] = [];

      generateReport(comparisonResults, baselineOnly, candidateOnly, testDir);

      const html = readFileSync(join(testDir, 'index.html'), 'utf-8');

      expect(html.toLowerCase()).toMatch(/fail|❌|✗/);
    });

    it('should show success status when no differences', () => {
      const comparisonResults: ComparisonResult[] = [
        {
          name: 'unchanged.png',
          hasDifference: false,
          diffPercentage: 0,
          baselineImagePath: join(testDir, 'unchanged-baseline.png'),
          candidateImagePath: join(testDir, 'unchanged-candidate.png'),
          diffImagePath: join(testDir, 'unchanged-diff.png'),
        },
      ];
      const baselineOnly: ScannedFile[] = [];
      const candidateOnly: ScannedFile[] = [];

      generateReport(comparisonResults, baselineOnly, candidateOnly, testDir);

      const html = readFileSync(join(testDir, 'index.html'), 'utf-8');

      expect(html.toLowerCase()).toMatch(/pass|✓|✔/);
    });
  });
});
