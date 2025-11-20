/**
 * Catmull-Rom Spline Interpolation Utility
 * Sprint: SP_015
 *
 * Implements Catmull-Rom spline algorithm for smooth curve generation
 * passing through all data points. Superior to linear interpolation for
 * creating visually appealing wave charts.
 *
 * References:
 * - https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
 * - https://www.cs.cmu.edu/~462/projects/assn2/assn2/catmullRom.pdf
 */

import { WavePoint, SplineConfig, DEFAULT_SPLINE_CONFIG } from '../types/comparison.types';

/**
 * 2D Point for internal calculations
 */
interface Point2D {
  x: number;
  y: number;
}

/**
 * Calculate Catmull-Rom spline interpolation between points
 *
 * @param points - Array of data points to interpolate
 * @param config - Spline configuration (tension, smoothness, alpha)
 * @returns SVG path data string (for 'd' attribute)
 */
export function generateCatmullRomPath(
  points: WavePoint[],
  config: SplineConfig = DEFAULT_SPLINE_CONFIG
): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    // Single point - just draw a circle
    return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
  }
  if (points.length === 2) {
    // Two points - straight line
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // Convert WavePoint to Point2D for calculations
  const simplePoints: Point2D[] = points.map(p => ({ x: p.x, y: p.y }));

  // Start path at first point
  let path = `M ${simplePoints[0].x} ${simplePoints[0].y}`;

  // Generate smooth curves between each pair of points
  for (let i = 0; i < simplePoints.length - 1; i++) {
    const p0 = simplePoints[Math.max(0, i - 1)]; // Previous point (or first if i=0)
    const p1 = simplePoints[i]; // Current point
    const p2 = simplePoints[i + 1]; // Next point
    const p3 = simplePoints[Math.min(simplePoints.length - 1, i + 2)]; // Point after next

    // Generate interpolated points between p1 and p2
    const interpolated = interpolateSegment(p0, p1, p2, p3, config);

    // Add interpolated points to path
    interpolated.forEach(point => {
      path += ` L ${point.x} ${point.y}`;
    });
  }

  return path;
}

/**
 * Interpolate a single segment between p1 and p2
 * using neighboring points p0 and p3 for curve calculation
 */
function interpolateSegment(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  config: SplineConfig
): Point2D[] {
  const { smoothness, alpha } = config;
  const points: Point2D[] = [];

  // Calculate time values (t) based on distance and alpha
  const t0 = 0;
  const t1 = getT(t0, p0, p1, alpha);
  const t2 = getT(t1, p1, p2, alpha);
  const t3 = getT(t2, p2, p3, alpha);

  // Generate smoothness number of interpolated points
  for (let i = 1; i <= smoothness; i++) {
    const t = t1 + (i / smoothness) * (t2 - t1);

    // Catmull-Rom basis calculation
    const A1 = interpolateT(p0, p1, t0, t1, t);
    const A2 = interpolateT(p1, p2, t1, t2, t);
    const A3 = interpolateT(p2, p3, t2, t3, t);

    const B1 = interpolateT(A1, A2, t0, t2, t);
    const B2 = interpolateT(A2, A3, t1, t3, t);

    const C = interpolateT(B1, B2, t1, t2, t);

    points.push(C);
  }

  return points;
}

/**
 * Calculate time value based on distance and alpha parameter
 * Alpha: 0 = uniform, 0.5 = centripetal (recommended), 1 = chordal
 */
function getT(t: number, p0: Point2D, p1: Point2D, alpha: number): number {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return t + Math.pow(distance, alpha);
}

/**
 * Linear interpolation between two points at time t
 */
function interpolateT(
  p0: Point2D,
  p1: Point2D,
  t0: number,
  t1: number,
  t: number
): Point2D {
  if (t1 === t0) return p0; // Avoid division by zero

  const factor = (t - t0) / (t1 - t0);
  return {
    x: p0.x + factor * (p1.x - p0.x),
    y: p0.y + factor * (p1.y - p0.y),
  };
}

/**
 * Calculate smooth path for wave chart visualization
 * Scales points to chart dimensions and applies spline interpolation
 *
 * @param dataPoints - Raw data points with scores (0-100)
 * @param chartWidth - Width of chart area
 * @param chartHeight - Height of chart area
 * @param config - Spline configuration
 * @returns SVG path data string
 */
export function generateWaveChartPath(
  dataPoints: { criterionIndex: number; score: number }[],
  chartWidth: number,
  chartHeight: number,
  config: SplineConfig = DEFAULT_SPLINE_CONFIG
): string {
  if (dataPoints.length === 0) return '';

  const numPoints = dataPoints.length;

  // Scale data points to chart dimensions
  const scaledPoints: WavePoint[] = dataPoints.map((dp, index) => {
    // X: Distribute evenly across chart width
    const x = (chartWidth / (numPoints - 1)) * index;

    // Y: Invert because SVG y increases downward (0 at top)
    // Score 100 should be at top (y=0), score 0 at bottom (y=chartHeight)
    const y = chartHeight - (dp.score / 100) * chartHeight;

    return {
      x,
      y,
      criterionId: `criterion_${index}`,
      criterionName: '',
      score: dp.score,
      vendorId: '',
    };
  });

  return generateCatmullRomPath(scaledPoints, config);
}

/**
 * Calculate point position on wave at given criterion index
 * Useful for tooltip positioning and interaction
 *
 * @param criterionIndex - Index of criterion (0-based)
 * @param score - Score value (0-100)
 * @param totalCriteria - Total number of criteria
 * @param chartWidth - Width of chart area
 * @param chartHeight - Height of chart area
 * @returns Point coordinates
 */
export function getWavePointPosition(
  criterionIndex: number,
  score: number,
  totalCriteria: number,
  chartWidth: number,
  chartHeight: number
): { x: number; y: number } {
  const x = (chartWidth / (totalCriteria - 1)) * criterionIndex;
  const y = chartHeight - (score / 100) * chartHeight;

  return { x, y };
}

/**
 * Find nearest wave point to mouse/touch coordinates
 * Used for tooltip display on hover/tap
 *
 * @param mouseX - Mouse X coordinate relative to chart
 * @param mouseY - Mouse Y coordinate relative to chart
 * @param wavePoints - All points on the wave
 * @param threshold - Maximum distance to consider (pixels)
 * @returns Nearest point or null if beyond threshold
 */
export function findNearestWavePoint(
  mouseX: number,
  mouseY: number,
  wavePoints: WavePoint[],
  threshold: number = 20
): WavePoint | null {
  let nearest: WavePoint | null = null;
  let minDistance = threshold;

  wavePoints.forEach(point => {
    const distance = Math.sqrt(
      Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = point;
    }
  });

  return nearest;
}

/**
 * Calculate bounding box for wave path
 * Useful for pan/zoom calculations
 *
 * @param wavePoints - All points on the wave
 * @returns Bounding box {minX, maxX, minY, maxY}
 */
export function getWaveBoundingBox(wavePoints: WavePoint[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (wavePoints.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = wavePoints[0].x;
  let maxX = wavePoints[0].x;
  let minY = wavePoints[0].y;
  let maxY = wavePoints[0].y;

  wavePoints.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  return { minX, maxX, minY, maxY };
}

/**
 * Simplify wave path by removing redundant points
 * Reduces SVG path complexity for better performance
 * Uses Ramer-Douglas-Peucker algorithm
 *
 * @param points - Original points
 * @param epsilon - Simplification tolerance (higher = more simplification)
 * @returns Simplified points array
 */
export function simplifyWavePath(
  points: WavePoint[],
  epsilon: number = 2
): WavePoint[] {
  if (points.length <= 2) return points;

  // Find point with maximum distance from line
  let maxDistance = 0;
  let maxIndex = 0;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(
      points[i],
      firstPoint,
      lastPoint
    );

    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDistance > epsilon) {
    const leftSegment = simplifyWavePath(points.slice(0, maxIndex + 1), epsilon);
    const rightSegment = simplifyWavePath(points.slice(maxIndex), epsilon);

    // Combine segments (remove duplicate middle point)
    return leftSegment.slice(0, -1).concat(rightSegment);
  }

  // Base case: return endpoints only
  return [firstPoint, lastPoint];
}

/**
 * Calculate perpendicular distance from point to line
 */
function perpendicularDistance(
  point: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  // Line length squared
  const lineLengthSquared = dx * dx + dy * dy;

  if (lineLengthSquared === 0) {
    // Line start and end are the same point
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2)
    );
  }

  // Calculate projection parameter
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
        lineLengthSquared
    )
  );

  // Calculate projection point
  const projectionX = lineStart.x + t * dx;
  const projectionY = lineStart.y + t * dy;

  // Return distance to projection
  return Math.sqrt(
    Math.pow(point.x - projectionX, 2) + Math.pow(point.y - projectionY, 2)
  );
}
