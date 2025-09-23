function normalizeError(error) {
  if (error instanceof Error) return error;
  const e = new Error(typeof error === 'string' ? error : 'Unknown error');
  if (error && typeof error === 'object') {
    if (error.message) e.message = String(error.message);
    if (error.code) e.code = error.code;
    if (error.stack) e.stack = String(error.stack);
  }
  return e;
}

function parseStack(stack) {
  if (!stack) return {};
  const lines = String(stack).split('\n').slice(1); 
  const frames = [];
  const frameRe =
    /^\s*at\s+(?:(?<fn>[^(\s]+)\s+\()?(?<file>.*?):(?<line>\d+):(?<col>\d+)\)?$/;

  for (const ln of lines) {
    const m = ln.match(frameRe);
    if (!m) continue;
    const { fn, file, line, col } = m.groups;
    frames.push({
      function: fn || '<anonymous>',
      file,
      line: Number(line),
      column: Number(col),
    });
  }
  return { frames };
}

module.exports = { normalizeError, parseStack };
