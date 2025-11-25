import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { PngFilePair } from '../lib/png-file-pair.js';
import { RED_PNG, LARGE_RED_PNG } from './fixtures/png-fixtures.js';

describe('PngFilePair', () => {
  const testDir = join(process.cwd(), 'test-fixtures-png-pair');

  beforeEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should load matched PNG files successfully', () => {
    const baselinePath = join(testDir, 'image.png');
    const candidatePath = join(testDir, 'image2.png');

    writeFileSync(baselinePath, RED_PNG);
    writeFileSync(candidatePath, RED_PNG);

    const pair = new PngFilePair(
      'image.png',
      { name: 'image.png', path: baselinePath },
      { name: 'image.png', path: candidatePath },
    );

    expect(pair.name).toBe('image.png');
    expect(pair.width).toBe(1);
    expect(pair.height).toBe(1);
    expect(pair.baselineData).toBeInstanceOf(Buffer);
    expect(pair.candidateData).toBeInstanceOf(Buffer);
  });

  it('should throw error if dimensions do not match', () => {
    const baselinePath = join(testDir, 'small.png');
    const candidatePath = join(testDir, 'large.png');

    writeFileSync(baselinePath, RED_PNG); // 1x1
    writeFileSync(candidatePath, LARGE_RED_PNG); // 2x2

    expect(
      () =>
        new PngFilePair(
          'test.png',
          { name: 'test.png', path: baselinePath },
          { name: 'test.png', path: candidatePath },
        ),
    ).toThrow(/different dimensions/);
  });

  it('should throw error if baseline file cannot be read', () => {
    const baselinePath = join(testDir, 'missing.png');
    const candidatePath = join(testDir, 'exists.png');

    writeFileSync(candidatePath, RED_PNG);

    expect(
      () =>
        new PngFilePair(
          'test.png',
          { name: 'test.png', path: baselinePath },
          { name: 'test.png', path: candidatePath },
        ),
    ).toThrow(/baseline/);
  });

  it('should throw error if candidate file cannot be read', () => {
    const baselinePath = join(testDir, 'exists.png');
    const candidatePath = join(testDir, 'missing.png');

    writeFileSync(baselinePath, RED_PNG);

    expect(
      () =>
        new PngFilePair(
          'test.png',
          { name: 'test.png', path: baselinePath },
          { name: 'test.png', path: candidatePath },
        ),
    ).toThrow(/candidate/);
  });
});
