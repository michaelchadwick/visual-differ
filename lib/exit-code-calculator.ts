import type { ComparisonResult } from './image-comparer.js';
import type { ScannedFile } from './file-scanner.js';

/**
 * Calculates the appropriate exit code based on comparison results
 * 
 * Exit code logic:
 * - 0: Success - no visual differences detected, only new files allowed
 * - 1: Failure - visual differences found or files removed from baseline
 * 
 * @param comparisonResults - Results from comparing matched image pairs
 * @param baselineOnly - Files that exist only in baseline (deleted in candidate)
 * @param candidateOnly - Files that exist only in candidate (new files)
 * @returns Exit code (0 for success, 1 for failure)
 */
export function calculateExitCode(
  comparisonResults: ComparisonResult[],
  baselineOnly: ScannedFile[],
  candidateOnly: ScannedFile[],
): number {
  // Check if any compared images have differences
  const hasDifferences = comparisonResults.some((result) => result.hasDifference);

  // Check if any baseline files are missing (deleted screenshots)
  const hasDeletedFiles = baselineOnly.length > 0;

  // Return 1 (failure) if there are differences or deleted files
  // Return 0 (success) if no changes or only new files
  return hasDifferences || hasDeletedFiles ? 1 : 0;
}
