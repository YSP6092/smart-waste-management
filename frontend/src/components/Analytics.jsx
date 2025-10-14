import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

const Analytics = ({ bins }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [wasteTypeData, setWasteTypeData] = useState([]);
  const [fillTrendData, setFillTrendData] = useState([]);

  useEffect(() => {
    generateAnalyticsData();
  }, [bins]);

  const generateAnalyticsData = () => {
    // Weekly collection data
    const weekly = [
      { day: 'Mon', collections: 45, avgFill: 75, efficiency: 85 },
      { day: 'Tue', collections: 52, avgFill: 82, efficiency: 88 },
      { day: 'Wed', collections: 38, avgFill: 68, efficiency: 82 },
      { day: 'Thu', collections: 61, avgFill: 88, efficiency: 92 },
      { day: 'Fri', collections: 55, avgFill: 79, efficiency: 86 },
      { day: 'Sat', collections: 70, avgFill: 92, efficiency: 95 },
      { day: 'Sun', collections: 42, avgFill: 65, efficiency: 80 }
    ];
    setWeeklyData(weekly);

    // Waste type distribution
    const wasteTypes = [
      { name: 'Organic', value: 40, color: '#22c55e' },
      { name: 'Plastic', value: 30, color: '#3b82f6' },
      { name: 'Paper', value: 20, color: '#eab308' },
      { name: 'Metal', value: 10, color: '#ef4444' }
    ];
    setWasteTypeData(wasteTypes);

    // Fill level trends by bin
    const trends = bins.map(bin => ({
      binId: bin.binId,
      fillLevel: bin.fillLevel,
      location: bin.location
    }));
    setFillTrendData(trends);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500 p-3 rounded-lg">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-slate-400">Data insights and trends</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Collections Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Weekly Collections
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="collections" fill="#10b981" name="Collections" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Fill Levels */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Average Fill Levels
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgFill" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Avg Fill %"
                dot={{ fill: '#3b82f6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Composition */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-500" />
            Waste Composition
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={wasteTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {wasteTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bin Fill Levels Comparison */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-500" />
            Current Fill Levels by Bin
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fillTrendData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="binId" type="category" stroke="#94a3b8" width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="fillLevel" fill="#eab308" name="Fill %" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Collection Efficiency Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Efficiency %"
                dot={{ fill: '#10b981', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgFill" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Avg Fill %"
                dot={{ fill: '#f59e0b', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Total Collections This Week</div>
          <div className="text-3xl font-bold text-emerald-500">363</div>
          <div className="text-xs text-slate-500 mt-1">↑ 12% from last week</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Avg Collection Efficiency</div>
          <div className="text-3xl font-bold text-blue-500">87%</div>
          <div className="text-xs text-slate-500 mt-1">↑ 5% improvement</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Waste Processed</div>
          <div className="text-3xl font-bold text-purple-500">2.4t</div>
          <div className="text-xs text-slate-500 mt-1">This week</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">CO₂ Saved</div>
          <div className="text-3xl font-bold text-green-500">156kg</div>
          <div className="text-xs text-slate-500 mt-1">Via optimized routes</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;