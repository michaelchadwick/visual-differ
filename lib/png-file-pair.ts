import { PNG } from 'pngjs';
import { readFileSync } from 'fs';

import type { ScannedFile } from './file-scanner';

/**
 * Error thrown when baseline and candidate images have different dimensions
 */
export class DimensionMismatchError extends Error {
  constructor(
    public readonly imageName: string,
    public readonly baselineWidth: number,
    public readonly baselineHeight: number,
    public readonly candidateWidth: number,
    public readonly candidateHeight: number,
  ) {
    super(
      `Images have different dimensions. ${imageName}: Baseline ${baselineWidth}x${baselineHeight}, Candidate ${candidateWidth}x${candidateHeight}`,
    );
    this.name = 'DimensionMismatchError';
  }
}

/**
 * Represents a matched pair of PNG files loaded and ready for comparison
 */
export class PngFilePair {
  public readonly name: string;
  public readonly width: number;
  public readonly height: number;
  public readonly baselineData: Buffer;
  public readonly candidateData: Buffer;

  /**
   * Creates a PngFilePair by loading and validating two matched PNG files
   * @param matchedFile - The matched file info from file scanner
   * @throws Error if files can't be loaded or dimensions differ
   */
  constructor(name: string, baseline: ScannedFile, candidate: ScannedFile) {
    this.name = name;

    let baselinePng: PNG;
    let candidatePng: PNG;

    try {
      const baselineBuffer = readFileSync(baseline.path);
      baselinePng = PNG.sync.read(baselineBuffer);
    } catch (error) {
      throw new Error(
        `Failed to read baseline PNG: ${baseline.path}. ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    try {
      const candidateBuffer = readFileSync(candidate.path);
      candidatePng = PNG.sync.read(candidateBuffer);
    } catch (error) {
      throw new Error(
        `Failed to read candidate PNG: ${candidate.path}. ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (baselinePng.width !== candidatePng.width || baselinePng.height !== candidatePng.height) {
      throw new DimensionMismatchError(
        this.name,
        baselinePng.width,
        baselinePng.height,
        candidatePng.width,
        candidatePng.height,
      );
    }

    this.width = baselinePng.width;
    this.height = baselinePng.height;
    this.baselineData = baselinePng.data;
    this.candidateData = candidatePng.data;
  }
}
