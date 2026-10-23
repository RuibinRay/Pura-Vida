// Writes docs/RESEARCH_SOURCES.md from the generated source registry and the research logs.
import fs from 'node:fs';
const reg = JSON.parse(fs.readFileSync('src/content/generated/sources.json', 'utf8'));
const byPublisher = new Map();
for (const s of reg.sources) { const k = s.publisher || new URL(s.url).hostname; if (!byPublisher.has(k)) byPublisher.set(k, []); byPublisher.get(k).push(s); }
let md = `# Research sources\n\nGenerated from \`src/content/generated/sources.json\` on ${reg.retrieved} by \`tools/export_sources.mjs\`. ${reg.sources.length} sources; every one was fetched on the retrieval date shown. Status words: *confirmed* = official or primary source; *approximate* = rounded, dated or secondary; *interpretation / folklore* = cultural readings; *uncertain* = could not be settled.\n\nThe agents' fetch logs (every URL tried, with failures) are in \`research/log-*.md\`.\n\n`;
for (const [pub, list] of [...byPublisher.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  md += `## ${pub}\n\n`;
  for (const s of list) md += `- [${s.title}](${s.url})${s.published ? ` — published ${s.published}` : ''} — read ${s.retrieved} — used for: ${s.usedFor.join('; ')}\n`;
  md += '\n';
}
md += `## Claims not yet verified (${reg.unverified.length})\n\n`;
for (const u of reg.unverified) md += `- **${u.claim}** — ${u.reason} _(${u.from})_\n`;
fs.writeFileSync('docs/RESEARCH_SOURCES.md', md);
console.log('docs/RESEARCH_SOURCES.md', reg.sources.length, 'sources');
