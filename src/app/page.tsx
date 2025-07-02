"use client";

import { useState, useRef, useEffect } from "react";
// markdown support
import ReactMarkdown from "react-markdown";
// markdown table support
import remarkGfm from "remark-gfm";

// For strict typing. Roles are needed to continue the chat with Gemini
interface Message {
  role: "user" | "model";
  content: string;
}

// Main Chat Component
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to smoothly scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initial message from the bot
  useEffect(() => {
    setMessages([
      {
        role: "model",
        content:
          "Hi, I'm your one stop for restaurant recommendations anytime and anywhere! I can suggest restaurants of any cuisine, give you quick summaries about what to expect from different restaurants, and help with pretty much anything you could want to know for pick your next meal!",
      },
    ]);
  }, []);

  // Auto scroll to the bottom when a new response is generated
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handler for submitting the user's message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // API call
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // TODO change it so that the bot responsds saying it had difficulty interpreting the user, asking the user to please rephrase
      if (!response.body) {
        throw new Error("Empty response from AI model");
      }

      // Append a new empty message bubble for the assistant's response
      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      // Handle streaming the response from the server
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      // Initialize the response as an empty string which we will then add chunks to as the response streams in

      // Process the stream
      // TODO Handle an infinite reader
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // Update the last message content with the new chunk
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          const updatedLastMessage = {
            ...lastMessage,
            content: lastMessage.content + chunk,
          };
          return [...prev.slice(0, prev.length - 1), updatedLastMessage];
        });
      }
    } catch (error) {
      console.error("Failed to fetch from chat API:", error);
      setMessages((prev) => {
        const errorMessage: Message = {
          role: "model",
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
        };
        return [...prev.slice(0, prev.length - 1), errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .markdown-content p {
          margin-bottom: 0.5rem;
        }
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content ul,
        .markdown-content ol {
          list-style-position: inside;
          padding-left: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content code {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        .markdown-content a {
          color: #818cf8;
          text-decoration: underline;
        }
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .markdown-content th,
        .markdown-content td {
          border: 1px solid #4a5568;
          padding: 0.5rem;
          text-align: left;
        }
        .markdown-content th {
          background-color: #2d3748;
        }
      `}</style>
      <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
        <header className="bg-gray-800 p-4 shadow-md border-b border-gray-700">
          <h1 className="text-2xl font-bold text-center text-indigo-400">
            Restaurant Recommender
          </h1>
          <p className="text-center text-sm text-gray-400">
            Your expert companion on all things restaurants!
          </p>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex my-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-4 rounded-2xl max-w-lg lg:max-w-xl xl:max-w-2xl break-words ${msg.role === "user" ? "bg-indigo-600 text-gray-200 rounded-br-none" : "bg-gray-700 text-gray-200 rounded-bl-none"}`}
                >
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start my-4">
                <div className="p-4 rounded-2xl bg-gray-700 text-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="bg-gray-800 p-4 border-t border-gray-700">
          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Where is the best place to get mediterranean food in flatiron?, What should I order at four charles?, ..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-l-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-r-full transition-colors duration-200"
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </>
  );
}
