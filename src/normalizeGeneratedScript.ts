export function normalizeGeneratedScript(raw: string): string {
  if (!raw.includes("data:")) return raw;

  return raw
    .replace(/\r\n/g, "\n")
    .split("\n\n")
    .map((event) =>
      event
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).replace(/^ /, ""))
        .join("\n"),
    )
    .join("");
}
