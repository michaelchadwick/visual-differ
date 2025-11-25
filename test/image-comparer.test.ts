import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { PngFilePair } from '../lib/png-file-pair.js';
import { compareImages, type ComparisonResult } from '../lib/image-comparer.js';
import { RED_PNG, BLUE_PNG } from './fixtures/png-fixtures.js';

describe('image-comparer', () => {
  const testDir = join(process.cwd(), 'test-fixtures-comparer');
  const outputDir = join(testDir, 'output');

  beforeEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('compareImages', () => {
    it('should detect identical images', () => {
      const baselinePath = join(testDir, 'image.png');
      const candidatePath = join(testDir, 'image2.png');

      writeFileSync(baselinePath, RED_PNG);
      writeFileSync(candidatePath, RED_PNG);

      const pair = new PngFilePair(
        'image.png',
        { name: 'image.png', path: baselinePath },
        { name: 'image.png', path: candidatePath },
      );

      const result: ComparisonResult = compareImages(pair, outputDir);

      expect(result.name).toBe('image.png');
      expect(result.hasDifference).toBe(false);
      expect(result.diffPercentage).toBe(0);
      expect(result.diffImagePath).toBe(join(outputDir, 'image.png-diff.png'));
      // Images should not be written for identical results
      expect(existsSync(result.diffImagePath)).toBe(false);
    });

    it('should detect different images', () => {
      const baselinePath = join(testDir, 'red.png');
      const candidatePath = join(testDir, 'blue.png');

      writeFileSync(baselinePath, RED_PNG);
      writeFileSync(candidatePath, BLUE_PNG);

      const pair = new PngFilePair(
        'test.png',
        { name: 'test.png', path: baselinePath },
        { name: 'test.png', path: candidatePath },
      );

      const result: ComparisonResult = compareImages(pair, outputDir);

      expect(result.name).toBe('test.png');
      expect(result.hasDifference).toBe(true);
      expect(result.diffPercentage).toBeGreaterThan(0);
      expect(result.diffImagePath).toBe(join(outputDir, 'test.png-diff.png'));
      expect(result.baselineImagePath).toBe(join(outputDir, 'test.png-baseline.png'));
      expect(result.candidateImagePath).toBe(join(outputDir, 'test.png-candidate.png'));
      expect(existsSync(result.diffImagePath)).toBe(true);
      expect(existsSync(result.baselineImagePath)).toBe(true);
      expect(existsSync(result.candidateImagePath)).toBe(true);
    });

    it('should calculate correct diff percentage', () => {
      const baselinePath = join(testDir, 'red.png');
      const candidatePath = join(testDir, 'blue.png');

      writeFileSync(baselinePath, RED_PNG);
      writeFileSync(candidatePath, BLUE_PNG);

      const pair = new PngFilePair(
        'test.png',
        { name: 'test.png', path: baselinePath },
        { name: 'test.png', path: candidatePath },
      );

      const result: ComparisonResult = compareImages(pair, outputDir);

      // For 1x1 image with one different pixel, it should be 100%
      expect(result.diffPercentage).toBe(100);
    });
  });
});
