'use client';

import { loginAction } from '@/actions/auth';
import { useState } from 'react';

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('email', 'mohamedgabel1@gmail.com');
    formData.append('password', '12345');
    
    try {
      const res = await loginAction(formData);
      setResult(res);
    } catch (err: any) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Login Action Test</h1>
      <button 
        onClick={runTest}
        className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition-colors"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Run Test'}
      </button>

      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
