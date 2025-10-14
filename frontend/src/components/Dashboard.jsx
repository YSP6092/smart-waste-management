import React, { useState, useEffect } from 'react';
import { getBins } from '../services/api';
import { Trash2, MapPin, Battery, Thermometer, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import io from 'socket.io-client';
import Analytics from './Analytics';
import AIPredictions from './AIPredictions';
import MapView from './MapView';
import Admin from './Admin';
import RouteOptimization from './RouteOptimization';
const Dashboard = () => {
  const [bins, setBins] = useState([]);
const [loading, setLoading] = useState(true);
const [connected, setConnected] = useState(false);
const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Initial fetch
    fetchBins();

    // Setup WebSocket connection
    const socket = io('http://localhost:5001');

    socket.on('connect', () => {
      console.log(' Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log(' Disconnected from server');
      setConnected(false);
    });

    socket.on('binUpdate', (updatedBins) => {
      console.log('📡 Received bin update');
      setBins(updatedBins);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchBins = async () => {
    const data = await getBins();
    setBins(data);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const criticalBins = bins.filter(b => b.status === 'critical').length;
  const warningBins = bins.filter(b => b.status === 'warning').length;
  const normalBins = bins.filter(b => b.status === 'normal').length;
  const avgFillLevel = bins.length > 0 ? (bins.reduce((acc, b) => acc + b.fillLevel, 0) / bins.length).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
    {/* Header */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-3 rounded-lg">
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Smart Waste Management</h1>
            <p className="text-slate-400">Real-time IoT Monitoring System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-sm text-slate-400">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

     {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'overview'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('ai-predictions')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'ai-predictions'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          AI Predictions
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'map'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Map View
        </button>
        <button
  onClick={() => setActiveTab('admin')}
  className={`px-6 py-3 font-semibold transition-all ${
    activeTab === 'admin'
      ? 'border-b-2 border-emerald-500 text-emerald-500'
      : 'text-slate-400 hover:text-white'
  }`}
>
  Admin
</button>
<button
  onClick={() => setActiveTab('routes')}
  className={`px-6 py-3 font-semibold transition-all ${
    activeTab === 'routes'
      ? 'border-b-2 border-emerald-500 text-emerald-500'
      : 'text-slate-400 hover:text-white'
  }`}
>
  Routes
</button>
      
      </div>
    </div>

    {/* Content */}
    {activeTab === 'overview' && (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Trash2 className="w-5 h-5 text-emerald-500" />
              <span className="text-2xl font-bold">{bins.length}</span>
            </div>
            <div className="text-sm text-slate-400">Total Bins</div>
            <div className="mt-2 text-xs text-emerald-400">All systems active</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold">{criticalBins}</span>
            </div>
            <div className="text-sm text-slate-400">Critical Bins</div>
            <div className="mt-2 text-xs text-red-400">Needs immediate attention</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{warningBins}</span>
            </div>
            <div className="text-sm text-slate-400">Warning Bins</div>
            <div className="mt-2 text-xs text-yellow-400">Schedule collection</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{avgFillLevel}%</span>
            </div>
            <div className="text-sm text-slate-400">Avg Fill Level</div>
            <div className="mt-2 text-xs text-blue-400">Across all bins</div>
          </div>
        </div>

        {/* Bins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bins.map(bin => (
            <div key={bin.binId} className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">{bin.binId}</h3>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(bin.status)} animate-pulse`}></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{bin.location}</span>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Fill Level</span>
                    <span className={`font-semibold ${getStatusText(bin.status)}`}>{bin.fillLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getStatusColor(bin.status)} transition-all duration-500`}
                      style={{ width: `${bin.fillLevel}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs text-slate-400">Battery</div>
                      <div className="text-sm font-semibold">{bin.battery}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="text-xs text-slate-400">Temp</div>
                      <div className="text-sm font-semibold">{bin.temperature}°C</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 pt-2">
                  <Clock className="w-3 h-3" />
                  <span>Updated {new Date(bin.lastUpdate).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {activeTab === 'analytics' && <Analytics bins={bins} />}
    {activeTab === 'ai-predictions' && <AIPredictions bins={bins} />}
    {activeTab === 'map' && <MapView bins={bins} />}
    {activeTab === 'admin' && <Admin bins={bins} onRefresh={fetchBins} />}
    {activeTab === 'routes' && <RouteOptimization bins={bins} />}

    {bins.length === 0 && (
      <div className="text-center text-slate-400 mt-20">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
        <p className="text-xl">No bins found</p>
      </div>
    )}
  </div>
);
};

export default Dashboard;