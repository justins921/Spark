/** Minimal RFC-4180 CSV parser — enough for the two seed files. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    if (row.length > 1 || row[0] !== "") rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") pushField();
    else if (c === "\n") {
      pushField();
      pushRow();
    } else if (c !== "\r") field += c;
  }
  pushField();
  pushRow();

  const [header, ...body] = rows;
  if (!header) return [];
  return body.map((cells) =>
    Object.fromEntries(
      header.map((key, i) => [key.trim(), (cells[i] ?? "").trim()]),
    ),
  );
}
