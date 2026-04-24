export interface KnownLocation {
  name: string;
  lat: number;
  lng: number;
}

export const JAPAN_LOCATIONS: KnownLocation[] = [
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Shibuya', lat: 35.6580, lng: 139.7016 },
  { name: 'Shinjuku', lat: 35.6938, lng: 139.7034 },
  { name: 'Akihabara', lat: 35.7023, lng: 139.7745 },
  { name: 'Asakusa', lat: 35.7148, lng: 139.7967 },
  { name: 'Harajuku', lat: 35.6702, lng: 139.7027 },
  { name: 'Ueno', lat: 35.7141, lng: 139.7774 },
  { name: 'Ginza', lat: 35.6717, lng: 139.7649 },
  { name: 'Roppongi', lat: 35.6627, lng: 139.7307 },
  { name: 'Shimokitazawa', lat: 35.6613, lng: 139.6680 },
  { name: 'Ikebukuro', lat: 35.7295, lng: 139.7109 },
  { name: 'Odaiba', lat: 35.6268, lng: 139.7768 },
  { name: 'Naka-Meguro', lat: 35.6440, lng: 139.6989 },
  { name: 'Tsukiji', lat: 35.6654, lng: 139.7707 },
  { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
  { name: 'Fushimi Inari', lat: 34.9671, lng: 135.7727 },
  { name: 'Arashiyama', lat: 35.0094, lng: 135.6670 },
  { name: 'Kinkaku-ji', lat: 35.0394, lng: 135.7292 },
  { name: 'Gion', lat: 35.0036, lng: 135.7756 },
  { name: 'Nishiki Market', lat: 35.0050, lng: 135.7649 },
  { name: 'Kiyomizu-dera', lat: 34.9949, lng: 135.7850 },
  { name: 'Osaka', lat: 34.6937, lng: 135.5023 },
  { name: 'Dotonbori', lat: 34.6687, lng: 135.5013 },
  { name: 'Namba', lat: 34.6659, lng: 135.5013 },
  { name: 'Shinsekai', lat: 34.6524, lng: 135.5063 },
  { name: 'Umeda', lat: 34.7055, lng: 135.4983 },
  { name: 'Osaka Castle', lat: 34.6873, lng: 135.5259 },
  { name: 'Nara', lat: 34.6851, lng: 135.8048 },
  { name: 'Nara Park', lat: 34.6851, lng: 135.8430 },
  { name: 'Hiroshima', lat: 34.3853, lng: 132.4553 },
  { name: 'Miyajima', lat: 34.2961, lng: 132.3196 },
  { name: 'Hakone', lat: 35.2326, lng: 139.1070 },
  { name: 'Kamakura', lat: 35.3192, lng: 139.5467 },
  { name: 'Nikko', lat: 36.7500, lng: 139.5981 },
  { name: 'Yokohama', lat: 35.4437, lng: 139.6380 },
  { name: 'Kobe', lat: 34.6901, lng: 135.1956 },
  { name: 'Nagoya', lat: 35.1815, lng: 136.9066 },
  { name: 'Fukuoka', lat: 33.5904, lng: 130.4017 },
  { name: 'Sapporo', lat: 43.0618, lng: 141.3545 },
  { name: 'Okinawa', lat: 26.3344, lng: 127.8056 },
  { name: 'Kanazawa', lat: 36.5613, lng: 136.6562 },
  { name: 'Takayama', lat: 36.1461, lng: 137.2522 },
  { name: 'Naoshima', lat: 34.4603, lng: 133.9953 },
  { name: 'Mt. Fuji', lat: 35.3606, lng: 138.7274 },
];

export const fuzzyMatchLocation = (input: string): KnownLocation | null => {
  if (!input) return null;
  const lower = input.toLowerCase().trim();

  const exact = JAPAN_LOCATIONS.find(
    (l) => l.name.toLowerCase() === lower
  );
  if (exact) return exact;

  const partial = JAPAN_LOCATIONS.find(
    (l) =>
      lower.includes(l.name.toLowerCase()) ||
      l.name.toLowerCase().includes(lower)
  );
  return partial || null;
};
