import { USD_PER_YEN } from './constants';

export const yenToUsd = (yen: number): string => {
  return (yen * USD_PER_YEN).toFixed(2);
};

export const formatYen = (yen: number): string => {
  return `¥${yen.toLocaleString()}`;
};

export const formatYenWithUsd = (yen: number): string => {
  return `¥${yen.toLocaleString()} (~$${yenToUsd(yen)})`;
};
