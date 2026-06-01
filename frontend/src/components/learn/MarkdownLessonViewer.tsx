/**
 * Lightweight markdown viewer. Renders headings (#/##/###),
 * code fences, inline code, bold, and bullet lists without
 * pulling in an extra dep. For richer rendering, swap in
 * react-markdown later.
 */
interface MarkdownLessonViewerProps {
  content: string;
}

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderInline = (line: string): string => {
  let out = escapeHtml(line);
  // bold
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // inline code
  out = out.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 text-[0.9em]">$1</code>');
  // links
  out = out.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-cyan-400 underline">$1</a>');
  return out;
};

const renderMarkdown = (md: string): string => {
  const lines = md.split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    if (raw.startsWith('```')) {
      if (inCode) {
        out.push(
          `<pre class="my-4 p-4 rounded-lg bg-black/60 text-emerald-200 text-sm overflow-x-auto"><code>${escapeHtml(
            codeBuffer.join('\n'),
          )}</code></pre>`,
        );
        codeBuffer = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(raw);
      continue;
    }
    if (/^#\s+/.test(raw)) {
      flushList();
      out.push(`<h1 class="text-3xl font-bold text-white mt-6 mb-3">${renderInline(raw.replace(/^#\s+/, ''))}</h1>`);
    } else if (/^##\s+/.test(raw)) {
      flushList();
      out.push(`<h2 class="text-2xl font-semibold text-white mt-5 mb-2">${renderInline(raw.replace(/^##\s+/, ''))}</h2>`);
    } else if (/^###\s+/.test(raw)) {
      flushList();
      out.push(`<h3 class="text-xl font-semibold text-slate-100 mt-4 mb-2">${renderInline(raw.replace(/^###\s+/, ''))}</h3>`);
    } else if (/^[-*]\s+/.test(raw)) {
      if (!inList) {
        out.push('<ul class="list-disc list-inside space-y-1 text-slate-300 my-3">');
        inList = true;
      }
      out.push(`<li>${renderInline(raw.replace(/^[-*]\s+/, ''))}</li>`);
    } else if (raw.trim() === '') {
      flushList();
      out.push('<div class="h-3"></div>');
    } else {
      flushList();
      out.push(`<p class="text-slate-300 leading-relaxed my-2">${renderInline(raw)}</p>`);
    }
  }
  flushList();
  return out.join('\n');
};

const MarkdownLessonViewer = ({ content }: MarkdownLessonViewerProps) => {
  return (
    <div
      data-testid="markdown-lesson-viewer"
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content || '') }}
    />
  );
};

export default MarkdownLessonViewer;
