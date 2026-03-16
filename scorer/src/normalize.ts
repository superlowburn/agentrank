import type { Signals } from "./signals.js";

export function logNormalize(value: number, maxValue: number): number {
  if (maxValue <= 0) return 0;
  return Math.log(1 + value) / Math.log(1 + maxValue);
}

export function normalizeSignals(
  signals: Signals,
  maxStars: number,
  maxContributors: number,
  maxDependents: number
): Signals {
  return {
    stars: logNormalize(signals.stars, maxStars),
    freshness: signals.freshness, // already 0-1
    issueHealth: signals.issueHealth, // already 0-1
    contributors: logNormalize(signals.contributors, maxContributors),
    dependents: logNormalize(signals.dependents, maxDependents),
    descriptionQuality: signals.descriptionQuality, // already 0-1
    licenseHealth: signals.licenseHealth, // already 0-1
  };
}
