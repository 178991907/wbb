
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export interface Tool {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  aiHint?: string;
  link: string;
}

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="px-3 pt-3 pb-1">
        <CardTitle className="text-base font-semibold">{tool.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-left space-y-2 px-3 pt-1 pb-2">
        {tool.imageUrl ? (
          <div className="aspect-[4/3] relative w-full bg-muted rounded-md overflow-hidden">
            <Image
              src={tool.imageUrl}
              alt={tool.title}
              fill
              className="object-contain"
              data-ai-hint={tool.aiHint || "icon"}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw" // Adjusted sizes based on more columns
            />
          </div>
        ) : (
          <div className="aspect-[4/3] w-full flex items-center justify-center bg-muted/50 rounded-md"> 
            {!tool.description && <span className="text-xs text-muted-foreground"></span>}
          </div>
        )}
        {tool.description && (
            <p className="text-sm text-muted-foreground min-h-[2.5em] line-clamp-2">{tool.description}</p>
        )}
        {!tool.imageUrl && !tool.description && (
            <div className="min-h-[2.5em]"></div>
        )}
      </CardContent>
      <CardFooter className="px-3 pb-3 pt-1">
        <Button variant="outline" size="sm" className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
          <a href={tool.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full">
            Visit Site
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
