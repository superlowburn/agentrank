import { scoreColor } from './tools';

export function generateBadgeSvg(score: number | null): string {
  const label = 'AgentRank';
  const value = score !== null ? score.toFixed(0) : 'unknown';
  const color = score !== null ? scoreColor(score) : '#9e9e9e';

  const CHAR_WIDTH = 6.8;
  const PADDING = 10;

  const labelWidth = Math.round(label.length * CHAR_WIDTH + PADDING);
  const valueWidth = Math.round(value.length * CHAR_WIDTH + PADDING);
  const totalWidth = labelWidth + valueWidth;

  const labelX = Math.round((labelWidth / 2) * 10);
  const valueX = Math.round((labelWidth + valueWidth / 2) * 10);

  const labelTextLength = Math.round(label.length * CHAR_WIDTH * 10);
  const valueTextLength = Math.round(value.length * CHAR_WIDTH * 10);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${labelTextLength}">${label}</text>
    <text x="${labelX}" y="140" transform="scale(.1)" fill="#fff" textLength="${labelTextLength}">${label}</text>
    <text aria-hidden="true" x="${valueX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${valueTextLength}">${value}</text>
    <text x="${valueX}" y="140" transform="scale(.1)" fill="#fff" textLength="${valueTextLength}">${value}</text>
  </g>
</svg>`;
}
