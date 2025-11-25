import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { compareDirectories, type CompareResult } from '../lib/visual-differ.js';
import { RED_PNG, BLUE_PNG } from './fixtures/png-fixtures.js';

describe('visual-differ', () => {
  const testDir = join(process.cwd(), 'test-fixtures-visual-differ');
  const baselineDir = join(testDir, 'baseline');
  const candidateDir = join(testDir, 'candidate');
  const outputDir = join(testDir, 'output');

  beforeEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(baselineDir, { recursive: true });
    mkdirSync(candidateDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('compareDirectories', () => {
    it('should return exit code 0 when all images are identical', () => {
      writeFileSync(join(baselineDir, 'image1.png'), RED_PNG);
      writeFileSync(join(candidateDir, 'image1.png'), RED_PNG);

      const result: CompareResult = compareDirectories(baselineDir, candidateDir, outputDir);

      expect(result.exitCode).toBe(0);
      expect(result.totalImages).toBe(1);
      expect(result.withDifferences).toBe(0);
      expect(result.withoutDifferences).toBe(1);
    });

    it('should return exit code 1 when images have differences', () => {
      writeFileSync(join(baselineDir, 'image1.png'), RED_PNG);
      writeFileSync(join(candidateDir, 'image1.png'), BLUE_PNG);

      const result: CompareResult = compareDirectories(baselineDir, candidateDir, outputDir);

      expect(result.exitCode).toBe(1);
      expect(result.totalImages).toBe(1);
      expect(result.withDifferences).toBe(1);
      expect(result.withoutDifferences).toBe(0);
    });

    it('should return exit code 1 when baseline files are missing', () => {
      writeFileSync(join(baselineDir, 'deleted.png'), RED_PNG);

      const result: CompareResult = compareDirectories(baselineDir, candidateDir, outputDir);

      expect(result.exitCode).toBe(1);
      expect(result.totalImages).toBe(1);
      expect(result.removedFiles).toBe(1);
    });

    it('should return exit code 0 with only new candidate files', () => {
      writeFileSync(join(candidateDir, 'new.png'), RED_PNG);

      const result: CompareResult = compareDirectories(baselineDir, candidateDir, outputDir);

      expect(result.exitCode).toBe(0);
      expect(result.totalImages).toBe(1);
      expect(result.addedFiles).toBe(1);
    });

    it('should generate diff images for changed files', () => {
      writeFileSync(join(baselineDir, 'changed.png'), RED_PNG);
      writeFileSync(join(candidateDir, 'changed.png'), BLUE_PNG);

      compareDirectories(baselineDir, candidateDir, outputDir);

      expect(existsSync(join(outputDir, 'changed.png-diff.png'))).toBe(true);
    });

    it('should generate OUTPUT.md report', () => {
      writeFileSync(join(baselineDir, 'image1.png'), RED_PNG);
      writeFileSync(join(candidateDir, 'image1.png'), RED_PNG);

      compareDirectories(baselineDir, candidateDir, outputDir);

      expect(existsSync(join(outputDir, 'OUTPUT.md'))).toBe(true);
    });

    it('should handle multiple images correctly', () => {
      writeFileSync(join(baselineDir, 'same.png'), RED_PNG);
      writeFileSync(join(baselineDir, 'different.png'), RED_PNG);
      writeFileSync(join(baselineDir, 'deleted.png'), RED_PNG);

      writeFileSync(join(candidateDir, 'same.png'), RED_PNG);
      writeFileSync(join(candidateDir, 'different.png'), BLUE_PNG);
      writeFileSync(join(candidateDir, 'new.png'), RED_PNG);

      const result: CompareResult = compareDirectories(baselineDir, candidateDir, outputDir);

      expect(result.exitCode).toBe(1);
      expect(result.totalImages).toBe(4);
      expect(result.withDifferences).toBe(1);
      expect(result.withoutDifferences).toBe(1);
      expect(result.removedFiles).toBe(1);
      expect(result.addedFiles).toBe(1);
    });

    it('should throw error if baseline directory does not exist', () => {
      const nonExistent = join(testDir, 'does-not-exist');

      expect(() => compareDirectories(nonExistent, candidateDir, outputDir)).toThrow();
    });

    it('should throw error if candidate directory does not exist', () => {
      const nonExistent = join(testDir, 'does-not-exist');

      expect(() => compareDirectories(baselineDir, nonExistent, outputDir)).toThrow();
    });

    it('should provide summary information in result', () => {
      writeFileSync(join(baselineDir, 'image1.png'), RED_PNG);
      writeFileSync(join(candidateDir, 'image1.png'), BLUE_PNG);

      const result: CompareResult = compareDirectories(baselineDir, candidateDir, outputDir);

      expect(result).toHaveProperty('exitCode');
      expect(result).toHaveProperty('totalImages');
      expect(result).toHaveProperty('withDifferences');
      expect(result).toHaveProperty('withoutDifferences');
      expect(result).toHaveProperty('removedFiles');
      expect(result).toHaveProperty('addedFiles');
    });
  });
});
