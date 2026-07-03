let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  const i = JSON.parse(d);
  const c = i.tool_input?.content || '';
  const lines = c.split('\n').length;
  if (lines > 800) {
    console.error('[Hook] BLOCKED: File exceeds 800 lines (' + lines + ' lines)');
    console.error('[Hook] Split into smaller modules');
    process.exit(2);
  }
  console.log(d);
});
