import type { Surface } from "./engine";

/**
 * Elevation point on a route (normalized coordinates)
 */
export interface ElevationPoint {
  /** Distance progress (0-1, where 0=start, 1=finish) */
  distance: number;
  /** Elevation (0-1, where 0=lowest, 1=highest) */
  elevation: number;
}

/**
 * Route profile type classification
 */
export type RouteProfileType =
  | "flat"
  | "rolling"
  | "hilly"
  | "mountainous"
  | "volcanic"
  | "coastal"
  | "urban"
  | "forest"
  | "desert";

/**
 * Environment biome for visual theming
 */
export type RouteBiome =
  | "urban"
  | "coastal"
  | "forest"
  | "mountain"
  | "desert"
  | "tropical"
  | "volcanic"
  | "plantation";

/**
 * Complete route profile definition for a race
 */
export interface RouteProfile {
  id: string;
  name: string;
  surface: Surface;

  /** Elevation control points defining the terrain curve */
  elevationPoints: ElevationPoint[];

  /** Profile classification */
  profileType: RouteProfileType;

  /** Terrain characteristics */
  characteristics: {
    /** Maximum incline/decline percentage */
    maxGrade: number;
    /** Total elevation gain in meters */
    totalElevationGain: number;
    /** Technical difficulty rating (1=beginner, 5=extreme) */
    technicalDifficulty: 1 | 2 | 3 | 4 | 5;
  };

  /** Environmental theming */
  environment: {
    biome: RouteBiome;
    /** Notable landmarks along the route */
    landmarks?: string[];
  };
}

/**
 * Interpolate elevation at a specific distance point using linear interpolation
 */
export function interpolateElevation(
  distance: number,
  points: ElevationPoint[],
): number {
  if (points.length === 0) return 0.5;
  if (distance <= 0) return points[0].elevation;
  if (distance >= 1) return points[points.length - 1].elevation;

  // Find the two points to interpolate between
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    if (distance >= p1.distance && distance <= p2.distance) {
      const t = (distance - p1.distance) / (p2.distance - p1.distance);
      return p1.elevation + (p2.elevation - p1.elevation) * t;
    }
  }

  return points[points.length - 1].elevation;
}
