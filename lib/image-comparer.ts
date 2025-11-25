import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
import type { PngFilePair } from './png-file-pair.js';

/**
 * Result of comparing two images
 */
export interface ComparisonResult {
  /** The filename that was compared */
  name: string;
  /** Whether the images have visual differences */
  hasDifference: boolean;
  /** Percentage of different pixels (0-100) */
  diffPercentage: number;
  /** Path to the baseline image in output directory */
  baselineImagePath: string;
  /** Path to the candidate image in output directory */
  candidateImagePath: string;
  /** Path to the generated diff image */
  diffImagePath: string;
  /** Optional dimension mismatch info if images have different dimensions */
  dimensionMismatch?: {
    baseline: string;
    candidate: string;
  };
}

/**
 * Compares two PNG images using pixelmatch and generates a diff image
 * @param filePair - The matched PNG file pair to compare
 * @param outputDir - Directory where output images should be written
 * @returns Comparison result with difference status and percentage
 */
export function compareImages(filePair: PngFilePair, outputDir: string): ComparisonResult {
  const { width, height } = filePair;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    filePair.baselineData,
    filePair.candidateData,
    diff.data,
    width,
    height,
    { threshold: 0.1 },
  );

  const hasDifference = numDiffPixels > 0;
  const totalPixels = width * height;
  const diffPercentage = totalPixels > 0 ? (numDiffPixels / totalPixels) * 100 : 0;

  // Build output paths
  const baselineOutputPath = join(outputDir, `${filePair.name}-baseline.png`);
  const candidateOutputPath = join(outputDir, `${filePair.name}-candidate.png`);
  const diffOutputPath = join(outputDir, `${filePair.name}-diff.png`);

  // Only write images if there are differences
  if (hasDifference) {
    writeFileSync(diffOutputPath, PNG.sync.write(diff));
    writeFileSync(baselineOutputPath, PNG.sync.write(filePair.baselinePng));
    writeFileSync(candidateOutputPath, PNG.sync.write(filePair.candidatePng));
  }

  return {
    name: filePair.name,
    hasDifference,
    diffPercentage,
    baselineImagePath: baselineOutputPath,
    candidateImagePath: candidateOutputPath,
    diffImagePath: diffOutputPath,
  };
}
