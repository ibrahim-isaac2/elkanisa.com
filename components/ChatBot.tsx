"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/ThemeContext";
import { Send, X, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// الدالة اللي بترسل لـ API Route
const sendToServerAPI = async (message: string) => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("خطأ من السيرفر:", errorData);
      throw new Error(`السيرفر رد بـ: ${response.status}`);
    }

    const data = await response.json();
    if (!data.reply) {
      throw new Error("الرد مش موجود");
    }
    return data.reply;
  } catch (error) {
    console.error("خطأ:", error);
    throw error;
  }
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const chatWindow = document.getElementById("chat-window");
      if (chatWindow) {
        chatWindow.classList.remove("scale-0");
        chatWindow.classList.add("scale-100");
      }
    }
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmedMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const botReply = await sendToServerAPI(trimmedMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botReply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "عذراً، حدث خطأ. جرب تاني!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50" dir="rtl">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn("h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105", theme === "dark" ? "bg-primary" : "bg-primary")}
          aria-label="فتح المحادثة"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card
          id="chat-window"
          className={cn("w-[300px] xs:w-[320px] sm:w-[350px] md:w-[400px] h-[450px] shadow-xl transition-all duration-300 transform scale-0", theme === "dark" ? "bg-card" : "bg-card")}
        >
          <CardHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold">شات بوت</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full" aria-label="إغلاق المحادثة">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 h-[320px]">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>مرحباً! كيف يمكنني مساعدتك اليوم؟</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col max-w-[80%] rounded-lg p-3", msg.sender === "user" ? "mr-auto bg-primary text-primary-foreground rounded-tr-none" : "ml-auto bg-muted rounded-tl-none")}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <span className="text-xs opacity-70 self-end mt-1">{formatTime(msg.timestamp)}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="اكتب رسالتك..." className={cn("flex-1", theme === "dark" ? "bg-muted" : "bg-muted")} disabled={isLoading} />
              <Button type="submit" disabled={isLoading || !message.trim()} className="px-3" aria-label="إرسال الرسالة">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}