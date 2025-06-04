// src/components/perspective-card.tsx
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface PerspectiveCardProps {
  title: string;
  advice: string;
  onRate: (rating: "up" | "down") => void;
  isLoading?: boolean;
}

export const PerspectiveCard: FC<PerspectiveCardProps> = ({ title, advice, onRate, isLoading = false }) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <p className="text-foreground whitespace-pre-wrap">{advice}</p>
        )}
      </CardContent>
      {!isLoading && advice && (
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onRate("up")} aria-label="Rate up">
            <ThumbsUp className="h-5 w-5 text-green-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onRate("down")} aria-label="Rate down">
            <ThumbsDown className="h-5 w-5 text-red-500" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
