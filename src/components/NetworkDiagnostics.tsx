
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp?: Date;
}

const NetworkDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', message: string) => {
    setDiagnostics(prev => [
      ...prev.filter(d => d.test !== test),
      {
        test,
        status,
        message,
        timestamp: new Date()
      }
    ]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    // Test 1: Client initialization
    try {
      if (supabase) {
        addResult('Client Init', 'success', 'Supabase client initialized successfully');
      } else {
        addResult('Client Init', 'error', 'Supabase client is null/undefined');
        setIsRunning(false);
        return;
      }
    } catch (error) {
      addResult('Client Init', 'error', `Client initialization failed: ${error}`);
      setIsRunning(false);
      return;
    }

    // Test 2: Basic connection
    try {
      const { data, error } = await supabase.from('content_calendar').select('count').limit(1);
      if (error) {
        addResult('Basic Connection', 'error', `Connection failed: ${error.message}`);
      } else {
        addResult('Basic Connection', 'success', 'Successfully connected to database');
      }
    } catch (error) {
      addResult('Basic Connection', 'error', `Connection exception: ${error}`);
    }

    // Test 3: Table access
    try {
      const { data, error } = await supabase.from('content_calendar').select('id').limit(1);
      if (error) {
        addResult('Table Access', 'error', `Table access failed: ${error.message}`);
      } else {
        addResult('Table Access', 'success', `Table accessible, found ${data?.length || 0} records`);
      }
    } catch (error) {
      addResult('Table Access', 'error', `Table access exception: ${error}`);
    }

    // Test 4: Insert permissions
    try {
      const testData = {
        topic: 'Diagnostic Test',
        scheduled_date: new Date().toISOString().split('T')[0],
        priority: 1,
        status: 'planned' as const,
        content_source: 'manual',
        category: 'Entertainment'
      };

      const { data, error } = await supabase
        .from('content_calendar')
        .insert(testData)
        .select();

      if (error) {
        addResult('Insert Test', 'error', `Insert failed: ${error.message}`);
      } else {
        addResult('Insert Test', 'success', 'Insert test successful');
        
        // Clean up test record
        if (data && data[0]) {
          await supabase.from('content_calendar').delete().eq('id', data[0].id);
        }
      }
    } catch (error) {
      addResult('Insert Test', 'error', `Insert exception: ${error}`);
    }

    // Test 5: Browser environment
    try {
      const userAgent = navigator.userAgent;
      const isOnline = navigator.onLine;
      addResult('Browser Env', 'success', `Online: ${isOnline}, Agent: ${userAgent.substring(0, 50)}...`);
    } catch (error) {
      addResult('Browser Env', 'error', `Browser check failed: ${error}`);
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Network & Database Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="mb-4 w-full"
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>
        
        <div className="space-y-2">
          {diagnostics.map((result) => (
            <div key={result.test} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{result.test}</div>
                <div className="text-sm text-gray-600">{result.message}</div>
                {result.timestamp && (
                  <div className="text-xs text-gray-400">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
              <Badge className={getStatusColor(result.status)}>
                {result.status}
              </Badge>
            </div>
          ))}
        </div>
        
        {diagnostics.length === 0 && !isRunning && (
          <div className="text-center text-gray-500 py-8">
            Click "Run Diagnostics" to test your connection
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkDiagnostics;
