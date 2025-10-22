export function sortMetadata(obj: Record<string, any>): Array<{ key: string; value: any }> {
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  return keys.map((k) => ({ key: k, value: obj[k] }));
}
