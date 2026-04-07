/**
 * Minimal QR-like matrix generator.
 * Produces a deterministic 21x21 boolean grid from any string.
 * Includes authentic finder patterns at 3 corners for visual realism.
 */
export function generateQRMatrix(data: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  // ── Finder pattern helper ─────────────────────────────────────────
  const addFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        matrix[row + r][col + c] =
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    }
  };

  // Three corner finder patterns
  addFinder(0, 0);   // top-left
  addFinder(0, 14);  // top-right
  addFinder(14, 0);  // bottom-left

  // Separator lines (white border around finders)
  for (let i = 0; i < 8; i++) {
    if (i < size) {
      matrix[7][i] = false;
      matrix[i][7] = false;
      matrix[7][size - 1 - i < 0 ? 0 : size - 1 - i] = false;
      matrix[i][size - 8] = false;
      matrix[size - 8][i] = false;
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // ── Data area: deterministic from string hash ─────────────────────
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern zones and timing patterns
      const inTopLeftFinder = r < 9 && c < 9;
      const inTopRightFinder = r < 9 && c >= size - 8;
      const inBottomLeftFinder = r >= size - 8 && c < 9;
      const onTimingRow = r === 6;
      const onTimingCol = c === 6;

      if (inTopLeftFinder || inTopRightFinder || inBottomLeftFinder ||
          onTimingRow || onTimingCol) {
        continue;
      }

      hash = ((hash << 5) - hash) + (r * size + c + 1);
      hash |= 0;
      matrix[r][c] = (hash & 3) !== 0; // ~75% fill for visual density
    }
  }

  return matrix;
}
