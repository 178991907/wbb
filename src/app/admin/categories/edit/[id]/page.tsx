'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import type { Category } from '@/app/admin/categories/page';
import { getStorage } from '@/lib/storage';

const LOCAL_STORAGE_CATEGORIES_KEY = 'linkHubCategories';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const storage = getStorage();
        const storedCategories = await storage.getData(LOCAL_STORAGE_CATEGORIES_KEY);
        if (storedCategories) {
          setAllCategories(storedCategories);
          const categoryToEdit = storedCategories.find(cat => cat.id === categoryId);
          if (categoryToEdit) {
            setName(categoryToEdit.name);
            setSlug(categoryToEdit.slug);
            setOriginalSlug(categoryToEdit.slug);
            setIcon(categoryToEdit.icon || '');
          } else {
            setError('Category not found.');
          }
        } else {
          setError('No categories found in storage.');
        }
      } catch (e) {
        console.error("Failed to load category from database:", e);
        setError('Failed to load category data. Data might be corrupted.');
      }
      setIsFetching(false);
    };

    loadCategory();
  }, [categoryId]);

  const generateSlug = (value: string) => {
    return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(generateSlug(newName));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name || !slug) {
      setError('Name and Slug are required.');
      setIsLoading(false);
      return;
    }

    if (slug !== originalSlug && allCategories.some(cat => cat.slug === slug)) {
      setError('This slug is already in use by another category. Please choose a different name or manually adjust the slug.');
      setIsLoading(false);
      return;
    }
    
    const categoryToUpdateIndex = allCategories.findIndex(cat => cat.id === categoryId);
    if (categoryToUpdateIndex === -1) {
      setError('Category not found for update.');
      setIsLoading(false);
      return;
    }

    const updatedCategory: Category = {
      ...allCategories[categoryToUpdateIndex],
      name,
      slug,
      icon,
    };

    try {
      const storage = getStorage();
      const updatedCategoriesList = [...allCategories];
      updatedCategoriesList[categoryToUpdateIndex] = updatedCategory;
      await storage.saveData(LOCAL_STORAGE_CATEGORIES_KEY, updatedCategoriesList);
      setAllCategories(updatedCategoriesList);

      setIsLoading(false);
      alert('Category updated successfully!');
      router.push('/admin/categories');
    } catch (e) {
      setError('Failed to update category. Please try again.');
      setIsLoading(false);
      console.error("Failed to update category in database", e);
    }
  };

  const handleCancel = () => {
    router.push('/admin/categories');
  };
  
  if (isFetching) {
    return <div>Loading category details...</div>;
  }

  if (error && !name) { 
    return <div className="p-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.push('/admin/categories')} className="mt-4">Go back to Categories</Button>
      </div>;
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleCancel} aria-label="Go back to categories">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-primary">Edit Category</h1>
      </div>

      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader>
          <CardTitle>Update Category Details</CardTitle>
          <CardDescription>Modify the information for this category.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Development"
                value={name}
                onChange={handleNameChange}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                type="text"
                placeholder="e.g. development"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                required
                className="h-10"
                aria-describedby="slug-description"
              />
              <p id="slug-description" className="text-xs text-muted-foreground">
                The slug is the URL-friendly version of the name. It should be unique.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                type="text"
                placeholder="e.g. code (Lucide icon name)"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="h-10"
              />
               <p className="text-xs text-muted-foreground">
                Optionally provide a Lucide icon name (e.g., `Code`, `Link`).
              </p>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
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
