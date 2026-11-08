/** Exact marketing routes only. Domain and framework settings remain authenticated. */
export function isPublicEntry(path: string) {
  return path === "/" || /^\/landing-[abc]\/?$/u.test(path);
}
