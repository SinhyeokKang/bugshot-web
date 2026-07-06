// Shared build-prestep helper: fetch with exponential backoff.
// GitHub raw / codeload occasionally return 429 (rate limit) or transient 5xx
// during CI; a single failure otherwise kills the whole build. Retries those
// (and network errors) with backoff; 4xx other than 429 fail fast (permanent).
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithRetry(url, options = {}, { tries = 4, baseDelay = 500 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < tries; attempt++) {
    if (attempt > 0) await sleep(baseDelay * 2 ** (attempt - 1));
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (!RETRYABLE_STATUS.has(res.status)) {
        throw new Error(`${res.status} ${res.statusText}: ${url}`);
      }
      lastErr = new Error(`${res.status} ${res.statusText}: ${url}`);
    } catch (err) {
      // Non-retryable HTTP error already formatted above → rethrow immediately.
      if (err.message?.match(/^\d{3} /) && !RETRYABLE_STATUS.has(Number(err.message.slice(0, 3)))) {
        throw err;
      }
      lastErr = err;
    }
  }
  throw new Error(`fetch failed after ${tries} tries: ${lastErr.message}`);
}
