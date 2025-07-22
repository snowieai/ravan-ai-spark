
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const NetworkDiagnostics = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const testResults: DiagnosticResult[] = [];

    // Test 1: Supabase Client Initialization
    try {
      if (supabase) {
        testResults.push({
          test: 'Supabase Client Initialization',
          status: 'pass',
          message: 'Supabase client initialized successfully',
          details: 'Client object exists and is properly configured'
        });
      } else {
        testResults.push({
          test: 'Supabase Client Initialization',
          status: 'fail',
          message: 'Supabase client is null or undefined',
          details: 'Check client configuration and imports'
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Supabase Client Initialization',
        status: 'fail',
        message: 'Failed to initialize Supabase client',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Basic Connection Test
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('content_calendar')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - startTime;

      if (error) {
        testResults.push({
          test: 'Database Connection',
          status: 'fail',
          message: `Connection failed: ${error.message}`,
          details: `Error code: ${error.code || 'unknown'}`
        });
      } else {
        testResults.push({
          test: 'Database Connection',
          status: 'pass',
          message: `Connection successful (${responseTime}ms)`,
          details: `Retrieved ${data?.length || 0} records`
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Database Connection',
        status: 'fail',
        message: 'Network error occurred',
        details: error instanceof Error ? error.message : 'Unknown network error'
      });
    }

    // Test 3: Table Access Test
    try {
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .limit(5);

      if (error) {
        testResults.push({
          test: 'Table Access',
          status: 'fail',
          message: `Table access failed: ${error.message}`,
          details: 'Check RLS policies and permissions'
        });
      } else {
        testResults.push({
          test: 'Table Access',
          status: 'pass',
          message: `Table access successful`,
          details: `Found ${data?.length || 0} records`
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Table Access',
        status: 'fail',
        message: 'Table access error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Insert Permissions Test
    try {
      const testItem = {
        topic: 'Test Item (Will be deleted)',
        scheduled_date: new Date().toISOString().split('T')[0],
        priority: 1,
        status: 'planned' as const,
        content_source: 'manual',
        category: 'Entertainment'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('content_calendar')
        .insert(testItem)
        .select();

      if (insertError) {
        testResults.push({
          test: 'Insert Permissions',
          status: 'fail',
          message: `Insert failed: ${insertError.message}`,
          details: 'Check RLS policies for INSERT operations'
        });
      } else if (insertData && insertData.length > 0) {
        // Clean up the test item
        await supabase
          .from('content_calendar')
          .delete()
          .eq('id', insertData[0].id);

        testResults.push({
          test: 'Insert Permissions',
          status: 'pass',
          message: 'Insert permissions working correctly',
          details: 'Test item created and deleted successfully'
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Insert Permissions',
        status: 'fail',
        message: 'Insert test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Browser Environment Check
    try {
      const checks = {
        localStorage: typeof localStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        websocket: typeof WebSocket !== 'undefined',
        https: window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      };

      const failedChecks = Object.entries(checks).filter(([_, passed]) => !passed);

      if (failedChecks.length === 0) {
        testResults.push({
          test: 'Browser Environment',
          status: 'pass',
          message: 'Browser environment is compatible',
          details: 'All required browser features are available'
        });
      } else {
        testResults.push({
          test: 'Browser Environment',
          status: 'warning',
          message: 'Some browser features are missing',
          details: `Missing: ${failedChecks.map(([key]) => key).join(', ')}`
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Browser Environment',
        status: 'fail',
        message: 'Browser environment check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Network & Database Diagnostics
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-gray-500">Click "Run Diagnostics" to test your connection.</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-gray-500">{result.details}</p>
                )}
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
              <div className="text-sm text-blue-800">
                <p>Passed: {results.filter(r => r.status === 'pass').length}</p>
                <p>Failed: {results.filter(r => r.status === 'fail').length}</p>
                <p>Warnings: {results.filter(r => r.status === 'warning').length}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkDiagnostics;
