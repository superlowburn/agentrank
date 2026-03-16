export interface Weights {
  stars: number;
  freshness: number;
  issueHealth: number;
  contributors: number;
  dependents: number;
  downloads: number;
  descriptionQuality: number;
  licenseHealth: number;
}

/**
 * Redistribute weights so they always sum to 1.0.
 * Signals with a 0 weight (unavailable data) have their portion spread to the others.
 */
function normalize(raw: Weights): Weights {
  const total = Object.values(raw).reduce((s, v) => s + v, 0);
  if (total === 0) {
    // Fallback: equal weight across non-zero entries (shouldn't happen)
    const nonZero = Object.keys(raw).length;
    return Object.fromEntries(Object.keys(raw).map((k) => [k, 1 / nonZero])) as unknown as Weights;
  }
  const factor = 1 / total;
  return {
    stars: raw.stars * factor,
    freshness: raw.freshness * factor,
    issueHealth: raw.issueHealth * factor,
    contributors: raw.contributors * factor,
    dependents: raw.dependents * factor,
    downloads: raw.downloads * factor,
    descriptionQuality: raw.descriptionQuality * factor,
    licenseHealth: raw.licenseHealth * factor,
  };
}

// Base weights — what each signal deserves when all data is available.
// Total = 1.00.
//   stars 10%  freshness 20%  issueHealth 20%  contributors 8%
//   dependents 22%  downloads 13%  descriptionQuality 4%  licenseHealth 3%
const BASE: Weights = {
  stars: 0.10,
  freshness: 0.20,
  issueHealth: 0.20,
  contributors: 0.08,
  dependents: 0.22,
  downloads: 0.13,
  descriptionQuality: 0.04,
  licenseHealth: 0.03,
};

/**
 * Return weights for a repo given which optional signals have real data.
 * Unavailable signals get weight 0; the remainder is normalized to 1.0.
 */
export function getWeights(hasDependents: boolean, hasDownloads: boolean): Weights {
  return normalize({
    ...BASE,
    dependents: hasDependents ? BASE.dependents : 0,
    downloads: hasDownloads ? BASE.downloads : 0,
  });
}

export function weightedScore(signals: Signals, weights: Weights): number {
  return (
    signals.stars * weights.stars +
    signals.freshness * weights.freshness +
    signals.issueHealth * weights.issueHealth +
    signals.contributors * weights.contributors +
    signals.dependents * weights.dependents +
    signals.downloads * weights.downloads +
    signals.descriptionQuality * weights.descriptionQuality +
    signals.licenseHealth * weights.licenseHealth
  );
}

// Import Signals here for the weightedScore signature
import type { Signals } from "./signals.js";
