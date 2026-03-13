import rankedSkillsData from '../../../data/ranked-skills.json';
import type { Skill } from './skills';

const skills: Skill[] = rankedSkillsData as Skill[];

export function getAllSkills(): Skill[] {
  return skills;
}

export function getTopSkills(n: number): Skill[] {
  return skills.slice(0, n);
}
