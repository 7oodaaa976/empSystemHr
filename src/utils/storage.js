export function load(key, fallback) {
  try {
    const x = localStorage.getItem(key);
    return x ? JSON.parse(x) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
