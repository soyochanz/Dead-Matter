export const UPDATE_CARD_COLUMNS = 'id,title,title_en,title_es,title_pt,date,version,category,slug';

// Only public card metadata is cached, never sessions or full HTML articles.
const cache = new Map();
const MAX_AGE = 5 * 60 * 1000;

export function readFeedCache(key) {
  const entry = cache.get(key);
  return entry && Date.now() - entry.time < MAX_AGE ? entry.data : null;
}

export async function loadFeed(key, makeQuery, signal) {
  const cached = readFeedCache(key);
  if (cached) return cached;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  let timeout;
  try {
    // The race also bounds requests waiting on auth before fetch begins.
    const result = await Promise.race([
      makeQuery().abortSignal(controller.signal),
      new Promise((_, reject) => { timeout = setTimeout(() => { controller.abort(); reject(new Error('Feed request timed out')); }, 10000); })
    ]);
    if (result.error) throw result.error;
    if (controller.signal.aborted) throw new Error('Feed request aborted');
    const data = result.data || [];
    cache.set(key, { data, time: Date.now() });
    return data;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
