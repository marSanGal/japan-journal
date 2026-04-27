import { GBP_PER_YEN } from './constants';

let liveRate: number | null = null;
let lastFetched = 0;
const CACHE_MS = 30 * 60 * 1000;

export const fetchLiveRate = async (): Promise<number> => {
  if (liveRate && Date.now() - lastFetched < CACHE_MS) return liveRate;

  try {
    const res = await fetch(
      'https://open.er-api.com/v6/latest/JPY'
    );
    if (!res.ok) throw new Error('rate fetch failed');
    const data = await res.json();
    const gbp = data?.rates?.GBP;
    if (typeof gbp === 'number') {
      liveRate = gbp;
      lastFetched = Date.now();
      return gbp;
    }
  } catch {
    // fall through to static fallback
  }
  return GBP_PER_YEN;
};

const getRate = (): number => liveRate ?? GBP_PER_YEN;

export const yenToGbp = (yen: number): string => {
  return (yen * getRate()).toFixed(2);
};

export const formatYen = (yen: number): string => {
  return `¥${yen.toLocaleString()}`;
};

export const formatYenWithGbp = (yen: number): string => {
  return `¥${yen.toLocaleString()} (~£${yenToGbp(yen)})`;
};
