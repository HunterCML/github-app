export interface ParsedBountyLabel {
  amount: number;
  currency: string;
  raw: string;
}

const DEFAULT_BOUNTY_LABEL_PREFIXES = ["pvium:", "pviumSandbox:"];

export function parseBountyLabel(labelName: string): ParsedBountyLabel | null {
  const match = labelName.trim().match(getBountyLabelPattern());
  if (!match) return null;

  return {
    amount: Number(match[1]),
    currency: (match[2] || "USDC").toUpperCase(),
    raw: labelName,
  };
}

export function extractBountyLabels(labels: Array<{ name?: string }>) {
  return labels
    .map((label) => (label.name ? parseBountyLabel(label.name) : null))
    .filter((label): label is ParsedBountyLabel => Boolean(label));
}

function getBountyLabelPattern() {
  const prefixes = getBountyLabelPrefixes(process.env.PVIUM_BOUNTY_LABEL_PREFIX);
  const prefixPattern = prefixes.map(escapeRegExp).join("|");

  return new RegExp(
    `^(?:${prefixPattern})(\\d+(?:\\.\\d+)?)\\s*([a-zA-Z0-9]+)?$`,
  );
}

function getBountyLabelPrefixes(value: string | undefined) {
  const configuredPrefixes = value
    ?.split(",")
    .map((prefix) => prefix.trim())
    .filter(Boolean);
  const prefixes = configuredPrefixes?.length
    ? configuredPrefixes
    : DEFAULT_BOUNTY_LABEL_PREFIXES;

  return prefixes.map(normalizeBountyLabelPrefix);
}

function normalizeBountyLabelPrefix(value: string | undefined) {
  const prefix = value?.trim() || DEFAULT_BOUNTY_LABEL_PREFIXES[0];
  return prefix.endsWith(":") ? prefix : `${prefix}:`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
