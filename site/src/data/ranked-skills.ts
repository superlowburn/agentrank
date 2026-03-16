import rankedSkillsData from '../../../data/ranked-skills.json';
import type { Skill } from './skills';
import { classifySkill } from './content-gen';

const skills: Skill[] = (rankedSkillsData as Skill[]).map((s) => ({
  ...s,
  category: classifySkill(s),
}));

export function getAllSkills(): Skill[] {
  return skills;
}

export function getTopSkills(n: number): Skill[] {
  return skills.slice(0, n);
}
