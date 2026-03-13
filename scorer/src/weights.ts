export interface Weights {
  stars: number;
  freshness: number;
  issueHealth: number;
  contributors: number;
  dependents: number;
  forks: number;
  descriptionQuality: number;
  licenseHealth: number;
}

// When dependents data is unavailable (0 for all), redistribute to other signals
export function getWeights(hasDependents: boolean): Weights {
  if (hasDependents) {
    return {
      stars: 0.10,
      freshness: 0.22,
      issueHealth: 0.22,
      contributors: 0.08,
      dependents: 0.22,
      forks: 0.05,
      descriptionQuality: 0.05,
      licenseHealth: 0.06,
    };
  }

  // Redistribute dependents weight (22%) proportionally across the other 7
  return {
    stars: 0.13,
    freshness: 0.28,
    issueHealth: 0.28,
    contributors: 0.10,
    dependents: 0.00,
    forks: 0.07,
    descriptionQuality: 0.07,
    licenseHealth: 0.07,
  };
}

export function weightedScore(
  signals: {
    stars: number;
    freshness: number;
    issueHealth: number;
    contributors: number;
    dependents: number;
    forks: number;
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
    signals.forks * weights.forks +
    signals.descriptionQuality * weights.descriptionQuality +
    signals.licenseHealth * weights.licenseHealth
  );
}
