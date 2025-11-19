import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MessageSquare, MessageSquareHeart, MessageSquareWarning, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, ArrowLeft, Copy, Check, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type PerspectiveType = 'angel' | 'devil';

export interface PerspectivePaneProps {
  type: PerspectiveType;
  initialMessage: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isActive: boolean;
  onToggle: () => void;
  className?: string;
  onRate?: (helpful: boolean) => void;
}

const PerspectivePane = ({
  type,
  initialMessage,
  messages = [],
  onSendMessage,
  isActive,
  onToggle,
  className,
  onRate,
}: PerspectivePaneProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const isAngel = type === 'angel';
  const title = isAngel ? 'Supportive Coach' : 'Straight-Talker';
  const bgColor = isAngel ? 'bg-blue-50' : 'bg-red-50';
  const borderColor = isAngel ? 'border-blue-200' : 'border-red-200';
  const textColor = isAngel ? 'text-blue-600' : 'text-red-600';
  const Icon = isAngel ? MessageSquareHeart : MessageSquareWarning;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(initialMessage);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", borderColor, className)}>
      <div 
        className={cn("p-3 flex items-center justify-between cursor-pointer", bgColor, {
          'border-b': isActive,
          [borderColor]: isActive
        })}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <div className={cn("p-1.5 rounded", isAngel ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600')}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className={cn("font-medium", textColor)}>{title}</h3>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", {
          'rotate-180': isActive
        })} />
      </div>
      
      {isActive && (
        <div className="p-4 bg-white">
          <div className="relative group mb-4">
            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="text-gray-700 pr-8">{initialMessage}</p>
          </div>

          {onRate && (
            <div className="flex items-center justify-end space-x-2 text-sm">
              <span className="text-gray-500">Helpful?</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-green-600 hover:bg-green-50"
                onClick={() => onRate(true)}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                Yes
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-red-600 hover:bg-red-50"
                onClick={() => onRate(false)}
              >
                <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                No
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface DualPerspectiveViewProps {
  angelAdvice: string;
  devilAdvice: string;
  onBack: () => void;
  className?: string;
}

export const DualPerspectiveView = ({
  angelAdvice,
  devilAdvice,
  onBack,
  className
}: DualPerspectiveViewProps) => {
  const [activeTab, setActiveTab] = useState<'angel' | 'devil'>('angel');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: activeTab === 'angel' 
          ? 'I understand your concern. Let me help you think through this with compassion and support.' 
          : 'Let me give it to you straight. Here\'s what you need to hear...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
  };

  const handleRate = (helpful: boolean) => {
    console.log(`Feedback: ${helpful ? 'Helpful' : 'Not helpful'}`);
  };

  return (
    <div className={cn("max-w-2xl mx-auto p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <Button 
            variant={activeTab === 'angel' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('angel')}
            className={cn(
              'rounded-md',
              activeTab === 'angel' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            Supportive
          </Button>
          <Button 
            variant={activeTab === 'devil' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('devil')}
            className={cn(
              'rounded-md',
              activeTab === 'devil' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            Direct
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <PerspectivePane
          type={activeTab}
          initialMessage={activeTab === 'angel' ? angelAdvice : devilAdvice}
          messages={messages}
          onSendMessage={handleSendMessage}
          isActive={true}
          onToggle={() => setActiveTab(activeTab === 'angel' ? 'devil' : 'angel')}
          onRate={handleRate}
        />
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          handleSendMessage(input);
        }}
        className="flex gap-2 mt-6"
      >
        <input
          type="text"
          placeholder={
            activeTab === 'angel'
              ? 'Ask the supportive coach...'
              : 'Ask the straight-talker...'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default DualPerspectiveView;
