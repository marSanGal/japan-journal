export interface KonbiniItem {
  id: string;
  name: string;
  icon: string;
  category: 'food' | 'drink' | 'snack' | 'experience';
}

export const KONBINI_ITEMS: KonbiniItem[] = [
  { id: 'onigiri', name: 'Onigiri (any flavor)', icon: '🍙', category: 'food' },
  { id: 'egg-sandwich', name: 'Egg sandwich', icon: '🥪', category: 'food' },
  { id: 'melon-pan', name: 'Melon pan', icon: '🍈', category: 'food' },
  { id: 'karaage', name: 'Karaage chicken', icon: '🍗', category: 'food' },
  { id: 'nikuman', name: 'Nikuman (meat bun)', icon: '🥟', category: 'food' },
  { id: 'oden', name: 'Oden', icon: '🍢', category: 'food' },
  { id: 'bento', name: 'Konbini bento', icon: '🍱', category: 'food' },
  { id: 'spaghetti', name: 'Spaghetti Napolitan', icon: '🍝', category: 'food' },
  { id: 'custard-pudding', name: 'Purin (custard pudding)', icon: '🍮', category: 'food' },
  { id: 'ice-cream', name: 'Ice cream bar', icon: '🍦', category: 'snack' },
  { id: 'kitkat', name: 'Weird Kit-Kat flavor', icon: '🍫', category: 'snack' },
  { id: 'pocky', name: 'Pocky', icon: '🥢', category: 'snack' },
  { id: 'chips', name: 'Seaweed chips', icon: '🥬', category: 'snack' },
  { id: 'mochi', name: 'Mochi snack', icon: '🍡', category: 'snack' },
  { id: 'castella', name: 'Castella cake', icon: '🍰', category: 'snack' },
  { id: 'strong-zero', name: 'Strong Zero', icon: '🍹', category: 'drink' },
  { id: 'boss-coffee', name: 'Boss canned coffee', icon: '☕', category: 'drink' },
  { id: 'matcha-latte', name: 'Matcha latte', icon: '🍵', category: 'drink' },
  { id: 'calpis', name: 'Calpis', icon: '🥛', category: 'drink' },
  { id: 'ramune', name: 'Ramune soda', icon: '🧃', category: 'drink' },
  { id: 'vending-machine', name: 'Hot drink from vending machine', icon: '🏧', category: 'experience' },
  { id: 'lawson', name: 'Visit Lawson', icon: '🏪', category: 'experience' },
  { id: 'seven-eleven', name: 'Visit 7-Eleven', icon: '7️⃣', category: 'experience' },
  { id: 'family-mart', name: 'Visit FamilyMart', icon: '🏬', category: 'experience' },
  { id: 'atm', name: 'Use konbini ATM', icon: '💴', category: 'experience' },
];
