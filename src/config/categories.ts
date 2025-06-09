export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  createdDate: string;
}

// Initial mock data if database is empty
export const initialMockCategories: Category[] = [
  { id: '1', name: '常用工具', slug: 'common-tools', createdDate: 'May 16, 2024', icon: 'tool' },
  { id: '2', name: '儿童游戏', slug: 'kids-games', createdDate: 'May 16, 2024', icon: 'gamepad-2' },
];