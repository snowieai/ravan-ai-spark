
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NetworkDiagnostics from '@/components/NetworkDiagnostics';

const Diagnostics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">System Diagnostics</h1>
          <p className="text-gray-600 mt-2">
            Use this page to diagnose network and database connectivity issues.
          </p>
        </div>
        
        <NetworkDiagnostics />
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Run Diagnostics" to test your connection</li>
            <li>• Check for any failing tests (red badges)</li>
            <li>• Share the results with support if issues persist</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
