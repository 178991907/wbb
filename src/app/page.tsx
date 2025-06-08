'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { LogoDisplay } from '@/components/dashboard/LogoDisplay';
import { HeaderNav } from '@/components/dashboard/HeaderNav';
import { ToolCard, type Tool } from '@/components/dashboard/ToolCard';
import { getStorage } from '@/lib/client-storage';
import type { Category } from '@/app/admin/categories/page';
import type { LinkItem } from '@/app/admin/links/new/page';

const siteSettings = {
  siteName: '英语全科启蒙', 
  logoUrl: 'https://pic1.imgdb.cn/item/6817c79a58cb8da5c8dc723f.png',
  welcomeMessageEn: 'Welcome to All-Subject English Enlightenment',
  welcomeMessageZh: '系统 (平台) 由 Erin 英语全科启蒙团队独立开发完成',
  footerText: '© 2025 All-Subject English Enlightenment. All rights reserved. 由 Terry 开发和维护',
};

// 存储键常量
const STORAGE_KEYS = {
  CATEGORIES: 'categories',
  LINKS: 'links',
} as const;

// 初始数据
const initialCategories = [
  { id: '1', name: '工作', color: '#FF5733' },
  { id: '2', name: '学习', color: '#33FF57' },
  { id: '3', name: '生活', color: '#3357FF' },
];

const initialLinks = [
  { id: '1', title: 'Google', url: 'https://www.google.com', categoryId: '1' },
  { id: '2', title: 'GitHub', url: 'https://github.com', categoryId: '2' },
  { id: '3', title: 'Stack Overflow', url: 'https://stackoverflow.com', categoryId: '2' },
];

export default function DashboardPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [links, setLinks] = useState(initialLinks);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const storage = getStorage();

        // 加载分类
        const savedCategories = await storage.getData(STORAGE_KEYS.CATEGORIES);
        if (savedCategories) {
          setCategories(savedCategories);
        }

        // 加载链接
        const savedLinks = await storage.getData(STORAGE_KEYS.LINKS);
        if (savedLinks) {
          setLinks(savedLinks);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 过滤链接
  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.url.toLowerCase().includes(searchTerm.toLowerCase());
    const category = categories.find(cat => cat.id === link.categoryId);
    return matchesSearch && category;
  });

  // 按分类分组
  const groupedLinks = filteredLinks.reduce((groups, link) => {
    const category = categories.find(cat => cat.id === link.categoryId);
    if (category) {
      if (!groups[category.id]) {
        groups[category.id] = {
          category,
          links: [],
        };
      }
      groups[category.id].links.push(link);
    }
    return groups;
  }, {} as Record<string, { category: typeof categories[0]; links: typeof links }>);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />

      <main className="flex-grow container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center">
        <div className="mb-12">
          <LogoDisplay logoUrl={siteSettings.logoUrl} siteName={siteSettings.siteName} />
        </div>

        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 bg-clip-text text-transparent animated-text-gradient-en">
          {siteSettings.welcomeMessageEn}
        </p>
        <p className="text-lg sm:text-xl lg:text-2xl font-semibold mb-12 bg-clip-text text-transparent animated-text-gradient-zh">
          {siteSettings.welcomeMessageZh}
        </p>

        <div className="max-w-xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索..."
              className="pl-10 py-3 text-base h-12 rounded-lg shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(groupedLinks).map(({ category, links }) => (
            <div
              key={category.id}
              className="border rounded-lg p-4"
              style={{ borderColor: category.color }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: category.color }}>
                {category.name}
              </h2>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>{siteSettings.footerText}</p>
      </footer>
    </div>
  );
}
