export interface Weights {
  stars: number;
  freshness: number;
  issueHealth: number;
  contributors: number;
  dependents: number;
  descriptionQuality: number;
  licenseHealth: number;
}

// When dependents data is unavailable (0 for all), redistribute to other signals
export function getWeights(hasDependents: boolean): Weights {
  if (hasDependents) {
    return {
      stars: 0.12,
      freshness: 0.23,
      issueHealth: 0.24,
      contributors: 0.09,
      dependents: 0.24,
      descriptionQuality: 0.05,
      licenseHealth: 0.03,
    };
  }

  // Redistribute dependents weight proportionally across the other signals
  return {
    stars: 0.16,
    freshness: 0.30,
    issueHealth: 0.32,
    contributors: 0.12,
    dependents: 0.00,
    descriptionQuality: 0.07,
    licenseHealth: 0.03,
  };
}

export function weightedScore(
  signals: {
    stars: number;
    freshness: number;
    issueHealth: number;
    contributors: number;
    dependents: number;
    descriptionQuality: number;
    licenseHealth: number;
  },
  weights: Weights
): number {
  return (
    signals.stars * weights.stars +
    signals.freshness * weights.freshness +
    signals.issueHealth * weights.issueHealth +
    signals.contributors * weights.contributors +
    signals.dependents * weights.dependents +
    signals.descriptionQuality * weights.descriptionQuality +
    signals.licenseHealth * weights.licenseHealth
  );
}
