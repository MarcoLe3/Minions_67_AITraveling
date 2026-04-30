'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PostContextType {
  data: any;
  loading: boolean;
  error: boolean;
  sendDataToServer: (payload: any) => Promise<any>;
}

const PostContext = createContext<PostContextType | null>(null);

export function PostProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);

  const sendDataToServer = useCallback(async (payload: any) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_IP ?? 'http://localhost:8000/generate-itinerary',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      setData(json);
      return json;
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PostContext value={{ data, loading, error, sendDataToServer }}>
      {children}
    </PostContext>
  );
}

export function usePostContext() {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePostContext must be used inside <PostProvider>');
  return context;
}