"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Clock, SendHorizonal, Library, Palette } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const dummyMessages: ChatMessage[] = [
  {
    id: "1",
    content: "Hello! How can I help you today?",
    isUser: false,
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    content: "I need help with writing a blog post about AI.",
    isUser: true,
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    content:
      "I'd be happy to help you with that! What specific aspects of AI would you like to focus on in your blog post?",
    isUser: false,
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: "4",
    content: "I want to write about how AI is changing the workplace.",
    isUser: true,
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "5",
    content:
      "Great topic! Here are some key points you might want to cover: automation of repetitive tasks, AI-powered decision making, new job roles emerging, and the need for human-AI collaboration. Would you like me to elaborate on any of these points?",
    isUser: false,
    timestamp: new Date(Date.now() - 60000),
  },
];

export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(dummyMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "Thanks for your message! I'm processing your request and will get back to you shortly.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between h-10 border-b px-2 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Clock className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.isUser
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input at Bottom */}
      <div className="p-4 bg-background">
        <div className="relative border rounded-lg p-3 bg-background">
          {/* Text Input Area */}
          <div className="mb-3">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="border-0 p-0 h-auto min-h-[24px] focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
              rows={2}
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Library className="h-4 w-4" />
                <span>Prompt Library</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Palette className="h-4 w-4" />
                <span>Style</span>
              </Button>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
