'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import type { LinkItem } from '../new/page'; 
import type { Category } from '@/app/admin/categories/page';
import { getStorage } from '@/lib/storage';

const LOCAL_STORAGE_CATEGORIES_KEY = 'linkHubCategories';
const LOCAL_STORAGE_LINKS_KEY = 'linkHubLinks';

const initialMockCategories: Category[] = [
  { id: '1', name: '常用工具', slug: 'common-tools', createdDate: 'May 16, 2024', icon: 'tool' },
  { id: '2', name: '儿童游戏', slug: 'kids-games', createdDate: 'May 16, 2024', icon: 'gamepad-2' },
];

export default function EditLinkPage() {
  const router = useRouter();
  const params = useParams();
  const linkId = params.id as string;

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [aiHint, setAiHint] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [allLinks, setAllLinks] = useState<LinkItem[]>([]);
  const [isFetching, setIsFetching] = useState(true);

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
        setAvailableCategories(parsedCategories);

        // Load links
        const storedLinks = await storage.getData(LOCAL_STORAGE_LINKS_KEY);
        if (storedLinks) {
          const parsedLinksList: LinkItem[] = storedLinks;
          setAllLinks(parsedLinksList);
          const linkToEdit = parsedLinksList.find(link => link.id === linkId);
          if (linkToEdit) {
            setTitle(linkToEdit.title);
            setUrl(linkToEdit.url);
            setDescription(linkToEdit.description || '');
            setFaviconUrl(linkToEdit.faviconUrl || '');
            setCategoryId(linkToEdit.categoryId);
            setImageUrl(linkToEdit.imageUrl || `https://placehold.co/120x80.png`);
            setAiHint(linkToEdit.aiHint || '');
          } else {
            setError('Link not found.');
          }
        } else {
          setError('No links found in storage.');
        }
      } catch (e) {
        console.error("Failed to load data from database:", e);
        setError('Failed to load data. Data might be corrupted.');
      }
      setIsFetching(false);
    };

    loadData();
  }, [linkId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (!title || !url || !categoryId) {
      setError('Title, URL, and Category are required.');
      setIsLoading(false);
      return;
    }

    try {
      new URL(url);
    } catch (_) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      setIsLoading(false);
      return;
    }
     if (faviconUrl) {
        try {
            new URL(faviconUrl);
        } catch (_) {
            setError('Please enter a valid Favicon URL or leave it empty.');
            setIsLoading(false);
            return;
        }
    }
    
    const selectedCategory = availableCategories.find(cat => cat.id === categoryId);
    const linkToUpdateIndex = allLinks.findIndex(link => link.id === linkId);
    if (linkToUpdateIndex === -1) {
        setError('Link not found for update.');
        setIsLoading(false);
        return;
    }

    const updatedLink: LinkItem = {
      ...allLinks[linkToUpdateIndex], 
      title,
      url,
      description,
      faviconUrl,
      categoryId,
      categoryName: selectedCategory?.name || 'Unknown Category',
      imageUrl: imageUrl || `https://placehold.co/120x80.png`,
      aiHint: aiHint || title.toLowerCase().split(' ').slice(0,2).join(' ') || 'link icon',
    };

    try {
      const storage = getStorage();
      const updatedLinksList = [...allLinks];
      updatedLinksList[linkToUpdateIndex] = updatedLink;
      await storage.saveData(LOCAL_STORAGE_LINKS_KEY, updatedLinksList);
      setAllLinks(updatedLinksList);

      setIsLoading(false);
      alert('Link updated successfully!'); 
      router.push('/admin/links');
    } catch (e) {
      setError('Failed to update link. Please try again.');
      setIsLoading(false);
      console.error("Failed to update link in database", e);
    }
  };

  const handleCancel = () => {
    router.push('/admin/links');
  };

  if (isFetching) {
    return <div>Loading link details...</div>;
  }

  if (error && !title) { 
    return <div className="p-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.push('/admin/links')} className="mt-4">Go back to Links</Button>
      </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleCancel} aria-label="Go back to links">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-primary">Edit Link</h1>
      </div>

      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader>
          <CardTitle>Update Link Details</CardTitle>
          <CardDescription>Modify the information for this link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Google Search"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="e.g. https://www.google.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g. The world's most popular search engine."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="faviconUrl"
                  type="url"
                  placeholder="e.g. https://www.google.com/favicon.ico"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  className="h-10 flex-grow"
                />
                <Button type="button" variant="outline" onClick={() => alert('Auto-detect not implemented yet.')}>
                  Auto-detect
                </Button>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="imageUrl">Display Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                URL for the link&apos;s display image on the ToolCard. Defaults to a placeholder.
              </p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="aiHint">AI Hint for Display Image (optional)</Label>
              <Input
                id="aiHint"
                type="text"
                placeholder="e.g. tech logo"
                value={aiHint}
                onChange={(e) => setAiHint(e.target.value)}
                className="h-10"
              />
               <p className="text-xs text-muted-foreground">
                Keywords for display image search (max 2 words).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.length > 0 ? (
                    availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                     <SelectItem value="disabled" disabled>No categories available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {error && (
             <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || availableCategories.length === 0}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
