import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { usePremium } from './PremiumContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIContextType {
  messages: Message[];
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  canQuery: boolean;
  decrementQueries: () => void;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { isPremium } = usePremium();

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const canQuery = isPremium || messages.length < 20;

  const decrementQueries = useCallback(() => {}, []);

  return (
    <AIContext.Provider value={{
      messages, addMessage, clearMessages, canQuery, decrementQueries,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI(): AIContextType {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
}
