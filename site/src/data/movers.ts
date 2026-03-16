import moversData from '../../../data/movers.json';

export interface Mover {
  identifier: string;
  name: string | null;
  current_score: number;
  previous_score: number;
  score_change: number;
  current_rank: number;
  previous_rank: number;
  rank_change: number;
}

export interface NewEntry {
  identifier: string;
  name: string | null;
  score: number;
  rank: number;
}

export interface MoversCategory {
  gainers: Mover[];
  losers: Mover[];
  new_entries: NewEntry[];
}

export interface MoversData {
  generated_at: string;
  comparison_date: string | null;
  days_span: number | null;
  has_data: boolean;
  tools: MoversCategory;
  skills: MoversCategory;
}

export function getMovers(): MoversData {
  return moversData as MoversData;
}
