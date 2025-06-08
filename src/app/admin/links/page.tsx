'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LinkItem } from './new/page'; 
import type { Category } from '../categories/page'; 
import { useToast } from "@/hooks/use-toast";
import { getStorage } from '@/lib/storage';

const LOCAL_STORAGE_CATEGORIES_KEY = 'linkHubCategories';
const LOCAL_STORAGE_LINKS_KEY = 'linkHubLinks';

const initialMockLinks: LinkItem[] = [
  { id: 'L1', title: '搜索 (Baidu)', url: 'https://www.baidu.com', categoryId: '1', categoryName: '常用工具', createdDate: 'May 16, 2024', imageUrl: 'https://placehold.co/120x80.png', aiHint: 'search baidu', faviconUrl: '' },
  { id: 'L2', title: '搜索 (Baidu)', url: 'https://www.baidu.com', categoryId: '1', categoryName: '常用工具', createdDate: 'May 16, 2024', imageUrl: 'https://placehold.co/120x80.png', aiHint: 'search baidu', faviconUrl: '' },
  { id: 'L3', title: 'guge (Google)', url: 'https://www.google.com', categoryId: '1', categoryName: '常用工具', createdDate: 'May 16, 2024', imageUrl: 'https://placehold.co/120x80.png', aiHint: 'search google', faviconUrl: '' },
  { id: 'L4', title: '字母游戏', url: '#game-alphabet', categoryId: '2', categoryName: '儿童游戏', createdDate: 'May 17, 2024', imageUrl: 'https://placehold.co/100x100.png', aiHint: 'alphabet game', faviconUrl: '' },
];

const initialMockCategories: Category[] = [
  { id: '1', name: '常用工具', slug: 'common-tools', createdDate: 'May 16, 2024', icon: 'tool' },
  { id: '2', name: '儿童游戏', slug: 'kids-games', createdDate: 'May 16, 2024', icon: 'gamepad-2' },
];

export default function AdminLinksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storage = getStorage();
        
        // Load categories
        const storedCategories = await storage.getData(LOCAL_STORAGE_CATEGORIES_KEY);
        let parsedCategories: Category[] = initialMockCategories;
        if (storedCategories) {
          parsedCategories = storedCategories;
        } else {
          await storage.saveData(LOCAL_STORAGE_CATEGORIES_KEY, initialMockCategories);
        }
        const catMap = new Map(parsedCategories.map(cat => [cat.id, cat.name]));
        setCategoriesMap(catMap);

        // Load links
        const storedLinks = await storage.getData(LOCAL_STORAGE_LINKS_KEY);
        if (storedLinks) {
          const parsedLinksList: LinkItem[] = storedLinks;
          const updatedLinks = parsedLinksList.map(link => ({
            ...link,
            categoryName: catMap.get(link.categoryId) || '未知分类',
          }));
          setLinks(updatedLinks);
        } else {
          const updatedInitialLinks = initialMockLinks.map(link => ({
            ...link,
            categoryName: catMap.get(link.categoryId) || link.categoryName || '未知分类',
          }));
          setLinks(updatedInitialLinks);
          await storage.saveData(LOCAL_STORAGE_LINKS_KEY, updatedInitialLinks);
        }
      } catch (e) {
        console.error("Failed to load data from database:", e);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    loadData();
  }, [toast]);
  
  const handleEdit = (linkId: string) => {
    router.push(`/admin/links/edit/${linkId}`);
  };

  const handleDelete = async (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      try {
        const updatedLinks = links.filter(link => link.id !== linkId);
        const storage = getStorage();
        await storage.saveData(LOCAL_STORAGE_LINKS_KEY, updatedLinks);
        setLinks(updatedLinks);
        toast({
          title: "Success",
          description: "Link deleted successfully.",
        });
      } catch (e) {
        console.error("Failed to delete link:", e);
        toast({
          title: "Error",
          description: "Failed to delete link. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  if (isLoading) {
    return <div>Loading links...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Links</h1>
        <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
          <Link href="/admin/links/new">
            <Plus className="mr-2 h-4 w-4" /> 添加链接
          </Link>
        </Button>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>现有链接</CardTitle>
          <CardDescription>查看、编辑或删除您的链接。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center"
                    >
                      {link.url.length > 30 ? `${link.url.substring(0, 30)}...` : link.url}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>{link.categoryName || 'N/A'}</TableCell>
                  <TableCell>{link.createdDate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(link.id)}
                      aria-label="编辑链接"
                      className="mr-2 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(link.id)}
                      aria-label="删除链接"
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {links.length === 0 && (
            <p className="text-center text-muted-foreground py-4">未找到任何链接。添加一个开始吧！</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
