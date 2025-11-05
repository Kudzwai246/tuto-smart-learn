import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: any;
  isOwn: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const StatusIcon = () => {
    if (!isOwn) return null;
    
    if (message.status === 'read') {
      return <CheckCheck className="w-4 h-4 text-primary" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck className="w-4 h-4 text-muted-foreground" />;
    }
    return <Check className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className={cn(
      "flex",
      isOwn ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2 relative",
        isOwn
          ? "gradient-primary text-white rounded-br-sm"
          : "bg-secondary text-foreground rounded-bl-sm"
      )}>
        <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs",
          isOwn ? "text-white/80" : "text-muted-foreground"
        )}>
          <span>{formatTime(message.created_at)}</span>
          <StatusIcon />
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
