// Strip next-intl rich-text tags (e.g. <guide>…</guide>, <store>…</store>),
// keeping inner text. The visible FAQ renders these via t.rich, but JSON-LD
// answer text must be plain — literal tags leak into structured data otherwise.
export function stripRichTags(msg: string): string {
  return msg.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*>/g, "");
}
