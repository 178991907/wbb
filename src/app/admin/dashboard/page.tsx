'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Link2, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getStorage } from '@/lib/storage';
import type { Category } from '@/app/admin/categories/page';
import type { LinkItem } from '@/app/admin/links/new/page';

const LOCAL_STORAGE_CATEGORIES_KEY = 'linkHubCategories';
const LOCAL_STORAGE_LINKS_KEY = 'linkHubLinks';

export default function AdminDashboardPage() {
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storage = getStorage();
        
        // Load categories
        const storedCategories = await storage.getData(LOCAL_STORAGE_CATEGORIES_KEY);
        if (storedCategories) {
          setTotalCategories(storedCategories.length);
        }

        // Load links
        const storedLinks = await storage.getData(LOCAL_STORAGE_LINKS_KEY);
        if (storedLinks) {
          setTotalLinks(storedLinks.length);
        }
      } catch (e) {
        console.error("Failed to load data from database:", e);
        setTotalCategories(0);
        setTotalLinks(0);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Folder className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">Manage your link categories.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/categories">View Categories</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Link2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinks}</div>
            <p className="text-xs text-muted-foreground">Manage your individual links.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/links">View Links</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="default" className="w-full" asChild>
              <Link href="/admin/categories/new">
                <Plus className="mr-2 h-4 w-4" /> Add New Category
              </Link>
            </Button>
            <Button variant="default" className="w-full" asChild>
              <Link href="/admin/links/new">
                <Plus className="mr-2 h-4 w-4" /> Add New Link
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Welcome to Link Hub Admin!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Use the navigation panel to manage your categories and links. Your changes will be
            reflected on the public-facing website.
          </p>
          <h3 className="font-semibold text-foreground pt-2">Get started by:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Adding a new <strong className="text-primary">category</strong> to group your links.</li>
            <li>Adding a new <strong className="text-primary">link</strong> to an existing category.</li>
            <li>
              Exploring the public{' '}
              <Link href="/" className="text-primary hover:underline font-medium inline-flex items-center">
                Link Hub page <ExternalLink className="ml-1 h-3 w-3" />
              </Link>{' '}
              to see your content.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
