import React, { useState, useEffect } from 'react';

const HealthMonitor: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({ status: 'error', message: 'Unable to connect to health check endpoint' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !healthStatus) {
    return (
      <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
        <span className="text-sm text-gray-600">Checking...</span>
      </div>
    );
  }

  if (!healthStatus) {
    return null;
  }

  const statusColor = healthStatus.status === 'healthy' 
    ? 'bg-green-100 text-green-800' 
    : healthStatus.status === 'degraded' 
      ? 'bg-yellow-100 text-yellow-800' 
      : 'bg-red-100 text-red-800';

  const statusText = healthStatus.status === 'healthy' 
    ? 'Operational' 
    : healthStatus.status === 'degraded' 
      ? 'Degraded' 
      : 'Offline';

  return (
    <div className="flex items-center px-3 py-1 rounded-full cursor-pointer" onClick={checkHealth}>
      <div className={`w-3 h-3 rounded-full mr-2 ${healthStatus.status === 'healthy' ? 'bg-green-500' : healthStatus.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
      <span className={`text-xs font-medium ${statusColor} px-2 py-1 rounded-full`}>
        {statusText}
      </span>
    </div>
  );
};

export default HealthMonitor;