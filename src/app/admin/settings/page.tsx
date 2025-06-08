
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast'; // For showing notifications

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state - initialize with example data or fetch from backend
  const [siteName, setSiteName] = useState('英语全科启蒙');
  const [siteDescription, setSiteDescription] = useState('Your one-stop platform for English learning resources and fun games.');
  const [logoUrl, setLogoUrl] = useState('https://pic1.imgdb.cn/item/6817c79a58cb8da5c8dc723f.png');
  const [welcomeMessageEn, setWelcomeMessageEn] = useState('Welcome to All-Subject English Enlightenment');
  const [welcomeMessageZh, setWelcomeMessageZh] = useState('系统 (平台) 由 Erin 英语全科启蒙团队独立开发完成');
  const [footerText, setFooterText] = useState('© 2025 All-Subject English Enlightenment. All rights reserved. 由 Terry 开发和维护');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // MOCK API CALL
    console.log('Saving settings:', {
      siteName,
      siteDescription,
      logoUrl,
      welcomeMessageEn,
      welcomeMessageZh,
      footerText,
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully (mock).",
      variant: "default", 
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Settings</h1>
      
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle>Site Configuration</CardTitle>
          <CardDescription>Manage general application settings and content for the public-facing site.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Site Name */}
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-base font-medium">Site Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            {/* Site Description */}
            <div className="space-y-2">
              <Label htmlFor="siteDescription" className="text-base font-medium">Site Description (optional)</Label>
              <Textarea
                id="siteDescription"
                placeholder="e.g. A collection of useful links"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="min-h-[100px] text-base"
              />
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-base font-medium">Logo URL (optional)</Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            {/* Welcome Messages Section */}
            <Card className="bg-muted/50 p-4 shadow-inner">
              <CardHeader className="p-2 pb-3">
                <CardTitle className="text-xl">Welcome Messages</CardTitle>
                <CardDescription className="text-sm">
                  These messages will be displayed on the homepage with animated colors.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessageEn" className="font-medium">Welcome Message (English)</Label>
                  <Textarea
                    id="welcomeMessageEn"
                    value={welcomeMessageEn}
                    onChange={(e) => setWelcomeMessageEn(e.target.value)}
                    className="min-h-[80px] text-base bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessageZh" className="font-medium">Welcome Message (Chinese)</Label>
                  <Textarea
                    id="welcomeMessageZh"
                    value={welcomeMessageZh}
                    onChange={(e) => setWelcomeMessageZh(e.target.value)}
                    className="min-h-[80px] text-base bg-card"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Footer Text */}
            <div className="space-y-2">
              <Label htmlFor="footerText" className="text-base font-medium">Footer Text</Label>
              <Textarea
                id="footerText"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="min-h-[100px] text-base"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white h-11 px-6 text-base" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
