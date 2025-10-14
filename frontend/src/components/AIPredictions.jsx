import React, { useState, useEffect } from 'react';
import { Brain, Clock, TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

const AIPredictions = ({ bins }) => {
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    generatePredictions();
    generateInsights();
  }, [bins]);

  const generatePredictions = () => {
    const predictionData = bins.map(bin => {
      // Calculate fill rate (% per hour)
      const fillRate = bin.fillLevel / 10; // Simulated rate
      
      // Calculate hours until full
      const hoursToFull = bin.fillLevel >= 95 
        ? 0 
        : ((100 - bin.fillLevel) / fillRate).toFixed(1);
      
      // Determine collection priority
      let priority = 'Low';
      let priorityColor = 'text-green-500';
      let recommendedTime = 'Tomorrow';
      
      if (hoursToFull <= 4) {
        priority = 'Critical';
        priorityColor = 'text-red-500';
        recommendedTime = 'Now';
      } else if (hoursToFull <= 12) {
        priority = 'High';
        priorityColor = 'text-orange-500';
        recommendedTime = 'Today';
      } else if (hoursToFull <= 24) {
        priority = 'Medium';
        priorityColor = 'text-yellow-500';
        recommendedTime = 'Today';
      }

      // Calculate optimal collection time
      const currentHour = new Date().getHours();
      const optimalHour = (currentHour + Math.floor(hoursToFull * 0.8)) % 24;
      
      return {
        binId: bin.binId,
        location: bin.location,
        currentFill: bin.fillLevel,
        hoursToFull: hoursToFull,
        fillRate: fillRate.toFixed(2),
        priority: priority,
        priorityColor: priorityColor,
        recommendedTime: recommendedTime,
        optimalCollectionTime: `${optimalHour}:00`,
        confidence: (85 + Math.random() * 10).toFixed(1)
      };
    });

    // Sort by priority
    const sorted = predictionData.sort((a, b) => {
      const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setPredictions(sorted);
  };

  const generateInsights = () => {
    const criticalCount = bins.filter(b => b.fillLevel >= 80).length;
    const avgFillRate = (bins.reduce((acc, b) => acc + b.fillLevel, 0) / bins.length / 10).toFixed(2);
    
    const insightsData = [
      {
        type: 'warning',
        icon: AlertCircle,
        color: 'text-orange-500',
        title: 'Peak Collection Time',
        description: `Predicted peak collection needed between 2 PM - 4 PM based on fill patterns. Plan ${criticalCount} immediate collections.`
      },
      {
        type: 'success',
        icon: CheckCircle,
        color: 'text-green-500',
        title: 'Route Optimization',
        description: 'AI suggests collecting BIN005, BIN008, BIN003 in sequence. Estimated 25% fuel cost savings this route.'
      },
      {
        type: 'info',
        icon: TrendingUp,
        color: 'text-blue-500',
        title: 'Fill Rate Analysis',
        description: `Average fill rate: ${avgFillRate}% per hour. BIN003 shows 15% faster rate - possible increased foot traffic.`
      },
      {
        type: 'info',
        icon: Calendar,
        color: 'text-purple-500',
        title: 'Weekend Forecast',
        description: 'ML model predicts 18% increase in waste volume this weekend. Recommend additional collection rounds Saturday afternoon.'
      }
    ];

    setInsights(insightsData);
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'Critical': 'bg-red-500',
      'High': 'bg-orange-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-green-500'
    };
    return styles[priority] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500 p-3 rounded-lg">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Predictions & Insights</h2>
          <p className="text-slate-400">Machine learning powered forecasting</p>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <insight.icon className={`w-6 h-6 ${insight.color} flex-shrink-0 mt-1`} />
              <div>
                <h3 className="font-semibold mb-2">{insight.title}</h3>
                <p className="text-sm text-slate-400">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Fill Level Predictions
          </h3>
          <p className="text-sm text-slate-400 mt-1">AI-calculated time to full capacity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Bin ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Location</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Current Fill</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Fill Rate</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Time to Full</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Priority</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Recommended</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred, idx) => (
                <tr key={idx} className="border-t border-slate-700 hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-semibold">{pred.binId}</td>
                  <td className="p-4 text-slate-300">{pred.location}</td>
                  <td className="p-4">
                    <span className={pred.priorityColor}>{pred.currentFill}%</span>
                  </td>
                  <td className="p-4 text-slate-400">{pred.fillRate}%/hr</td>
                  <td className="p-4 font-semibold">
                    {pred.hoursToFull == 0 ? 'Full Now' : `${pred.hoursToFull} hrs`}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(pred.priority)}`}>
                      {pred.priority}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{pred.recommendedTime}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-700 rounded-full h-2 max-w-[80px]">
                        <div 
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${pred.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400">{pred.confidence}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimal Collection Schedule */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          AI-Optimized Collection Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-red-500/30">
            <div className="text-red-500 font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Immediate (Now)
            </div>
            <div className="space-y-2">
              {predictions.filter(p => p.priority === 'Critical').map(p => (
                <div key={p.binId} className="text-sm">
                  <span className="font-semibold">{p.binId}</span>
                  <span className="text-slate-400"> - {p.location}</span>
                </div>
              ))}
              {predictions.filter(p => p.priority === 'Critical').length === 0 && (
                <div className="text-sm text-slate-500">No urgent collections</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-yellow-500/30">
            <div className="text-yellow-500 font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Today
            </div>
            <div className="space-y-2">
              {predictions.filter(p => p.priority === 'High' || p.priority === 'Medium').slice(0, 3).map(p => (
                <div key={p.binId} className="text-sm">
                  <span className="font-semibold">{p.binId}</span>
                  <span className="text-slate-400"> - {p.optimalCollectionTime}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-green-500/30">
            <div className="text-green-500 font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Tomorrow
            </div>
            <div className="space-y-2">
              {predictions.filter(p => p.priority === 'Low').slice(0, 3).map(p => (
                <div key={p.binId} className="text-sm">
                  <span className="font-semibold">{p.binId}</span>
                  <span className="text-slate-400"> - {p.location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictions;