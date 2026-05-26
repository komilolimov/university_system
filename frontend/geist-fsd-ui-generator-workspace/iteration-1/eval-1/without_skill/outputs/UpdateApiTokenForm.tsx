'use client'

import { useState } from 'react';
import { updateApiTokenAction } from './actions';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function UpdateApiTokenForm() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setStatus('loading');
    
    try {
      const result = await updateApiTokenAction(token);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        setToken('');
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred');
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm font-sans">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Update API Token</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Enter your new API token to authenticate requests.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="token" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50">
            API Token
          </label>
          <Input
            id="token"
            type="password"
            placeholder="sk_live_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={status === 'loading'}
            className="font-mono text-sm"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={status === 'loading' || !token}
          className="w-full transition-all duration-200"
        >
          {status === 'loading' ? 'Updating...' : 'Save Token'}
        </Button>

        {message && (
          <p className={`text-sm mt-4 p-3 rounded-md border ${
            status === 'success' 
              ? 'bg-zinc-50 border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50' 
              : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-200'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
