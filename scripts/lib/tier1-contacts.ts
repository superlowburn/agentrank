/**
 * Tier 1 Contacts — Steve's personal relationships.
 *
 * @AgentRank_ai must NEVER reply to, mention, or engage with these accounts.
 * Those relationships are managed by @comforteagle only.
 *
 * Add handles WITHOUT the @ prefix, lowercase.
 */
export const TIER1_CONTACTS: ReadonlySet<string> = new Set([
  "alexalbert__",
  "anthropicai",
  "cursor_ai",
  "aaborondia",
  "alexravsky",
  "amandaaskell",
  "daboross",
  "danielgross",
  "garrytan",
  "jackclark",
  "kaboross",
  "levelsio",
  "sundarpichai",
  "sataboross",
  "sama",
  "elikistataylor",
  "naval",
  "patrickc",
  "tolokonina_",
  "danielsgriffin",
  "cloisteredaway",
  "birddogai",
]);

export function isTier1(handle: string): boolean {
  return TIER1_CONTACTS.has(handle.replace(/^@/, "").toLowerCase());
}
