/* Dependency-free syntax highlighting for dynamically rendered POWER pages. */
(() => {
  const root = document.getElementById("app");
  if (!root) return;

  const highlightedSource = new WeakMap();
  const escapeHTML = (value) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const wrap = (kind, value) =>
    '<span class="syn-' + kind + '">' + escapeHTML(value) + "</span>";

  const keywords = new Set(
    (
      "async await break case catch class const continue debugger default delete do else " +
      "export extends false finally for from function if import in instanceof let new null " +
      "of return static super switch this throw true try typeof undefined var void while yield " +
      "def elif except pass raise with as lambda True False None"
    ).split(/\s+/),
  );

  const shellCommand =
    /^(?:git|cd|cp|mv|mkdir|rm|curl|wget|npm|npx|node|python|pip|Set-Location|Copy-Item|powershell(?:\.exe)?|irm|echo|export|sudo|bash|chmod)\b/i;

  function highlightShell(raw) {
    return raw
      .split("\n")
      .map((line) => {
        if (/^\s*#/.test(line)) return wrap("comment", line);
        const prompt = line.match(/^(\s*)([$>])\s?(.*)$/);
        if (prompt) {
          return (
            escapeHTML(prompt[1]) +
            wrap("prompt", prompt[2] + " ") +
            wrap("command", prompt[3])
          );
        }
        const command = line.match(/^(\s*)(\S+)(.*)$/);
        if (command && shellCommand.test(command[2])) {
          return (
            escapeHTML(command[1]) +
            wrap("command", command[2]) +
            escapeHTML(command[3])
          );
        }
        return escapeHTML(line);
      })
      .join("\n");
  }

  /* Markup (HTML) is highlighted in ONE left-to-right pass.
     Every piece of the original text is cut out once, escaped once and wrapped
     once. (An older version ran several find-and-replace passes over its own
     output, so later passes matched inside the <span class="..."> it had just
     written and produced garbage like  <syn-attr">class="syn-tag">.) */

  /* An HTML comment, or a tag. Quoted attribute values may contain ">" safely. */
  const markupToken =
    /<!--[\s\S]*?-->|<\/?[A-Za-z](?:[^<>"']|"[^"]*"|'[^']*')*>/g;

  /* name, or name="value" / name='value' / name=value */
  const attributePattern =
    /([^\s=\/"'<>]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'<>]+))?/g;

  function highlightTag(tag) {
    const parts = tag.match(/^(<\/?)([A-Za-z][\w:-]*)([\s\S]*?)(\/?>)$/);
    if (!parts) return escapeHTML(tag);

    const [, open, name, rest, close] = parts;
    let html = escapeHTML(open) + wrap("tag", name);
    let last = 0;

    for (const attr of rest.matchAll(attributePattern)) {
      html += escapeHTML(rest.slice(last, attr.index));
      html += wrap("attr", attr[1]);
      if (attr[2] !== undefined) {
        html += escapeHTML(attr[2]) + wrap("string", attr[3]);
      }
      last = attr.index + attr[0].length;
    }

    return html + escapeHTML(rest.slice(last)) + escapeHTML(close);
  }

  /* Plain text between tags. Lines that start with // are comments. */
  function highlightMarkupText(text, startsAtLineStart) {
    return text
      .split("\n")
      .map((line, index) =>
        (index > 0 || startsAtLineStart) && /^\s*\/\//.test(line)
          ? wrap("comment", line)
          : escapeHTML(line),
      )
      .join("\n");
  }

  function highlightMarkup(raw) {
    let html = "";
    let last = 0;

    for (const match of raw.matchAll(markupToken)) {
      const before = raw.slice(last, match.index);
      html += highlightMarkupText(
        before,
        last === 0 || raw[last - 1] === "\n",
      );
      html += match[0].startsWith("<!--")
        ? wrap("comment", match[0])
        : highlightTag(match[0]);
      last = match.index + match[0].length;
    }

    return (
      html + highlightMarkupText(raw.slice(last), last === 0 || raw[last - 1] === "\n")
    );
  }

  function highlightCode(raw) {
    const tokenPattern =
      /\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|===?|!==?|=>|[+*/%=!<>-]/g;
    let html = "";
    let last = 0;
    for (const match of raw.matchAll(tokenPattern)) {
      html += escapeHTML(raw.slice(last, match.index));
      const token = match[0];
      let kind = "";
      if (/^(?:\/\/|\/\*|#)/.test(token)) kind = "comment";
      else if (/^["'`]/.test(token)) kind = "string";
      else if (/^\d/.test(token)) kind = "number";
      else if (keywords.has(token)) kind = "keyword";
      else if (
        /^[A-Za-z_$]/.test(token) &&
        /^\s*\(/.test(
          raw.slice(match.index + token.length, match.index + token.length + 8),
        )
      )
        kind = "function";
      else if (/^(?:===?|!==?|=>|[+*/%=!<>-])$/.test(token)) kind = "operator";
      html += kind ? wrap(kind, token) : escapeHTML(token);
      last = match.index + token.length;
    }
    return html + escapeHTML(raw.slice(last));
  }

  function highlight(pre) {
    const raw = pre.textContent;
    if (!raw.trim() || highlightedSource.get(pre) === raw) return;

    let html;
    const looksLikeShell =
      /(^|\n)\s*(?:[$>]\s|#\s|git\s|cd\s|cp\s|curl\s|npm\s|node\s|Set-Location\b|Copy-Item\b|powershell\b|python\s|irm\s)/i.test(
        raw,
      ) && !/\b(?:const|let|function|class|return|import|export)\b/.test(raw);
    const looksLikeMarkup =
      /<\/?(?:a|div|include|script|style|h[1-6]|p|img|main|section|button|template|html|body|pre|code)\b/i.test(
        raw,
      );

    if (looksLikeShell) html = highlightShell(raw);
    else if (looksLikeMarkup) html = highlightMarkup(raw);
    else html = highlightCode(raw);

    /* Safety net: colours must never change the TEXT. If they did (a bug in a
       highlighter), show the plain code instead of garbled code. */
    const probe = document.createElement("div");
    probe.innerHTML = html;
    if (probe.textContent !== raw) html = escapeHTML(raw);

    pre.innerHTML = html;
    pre.classList.add("syntax-block");
    highlightedSource.set(pre, raw);
  }

  function scan(node) {
    if (
      node.nodeType !== Node.ELEMENT_NODE &&
      node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    )
      return;
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.matches("pre:not([data-no-highlight])")
    )
      highlight(node);
    node.querySelectorAll?.("pre:not([data-no-highlight])").forEach(highlight);
  }

  scan(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "childList") {
        record.addedNodes.forEach(scan);
        if (record.target.nodeType === Node.ELEMENT_NODE) {
          const parentPre = record.target.closest(
            "pre:not([data-no-highlight])",
          );
          if (parentPre) highlight(parentPre);
        }
      } else if (record.type === "characterData") {
        const parentPre = record.target.parentElement?.closest(
          "pre:not([data-no-highlight])",
        );
        if (parentPre) highlight(parentPre);
      }
    }
  });
  observer.observe(root, {
    childList: true,
    characterData: true,
    subtree: true,
  });
})();
