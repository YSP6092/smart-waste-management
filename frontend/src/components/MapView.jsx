import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Map, Navigation, MapPin, Trash2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ bins }) => {
  const [selectedBin, setSelectedBin] = useState(null);
  const [routeMode, setRouteMode] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);

  // Center of Nagpur
  const centerPosition = [21.1458, 79.0882];

  useEffect(() => {
    if (routeMode) {
      calculateOptimalRoute();
    }
  }, [routeMode, bins]);

  const calculateOptimalRoute = () => {
    // Get critical and warning bins
    const urgentBins = bins.filter(b => b.status === 'critical' || b.status === 'warning');
    
    // Simple nearest neighbor route optimization
    const route = [];
    let currentPos = centerPosition;
    let remainingBins = [...urgentBins];

    while (remainingBins.length > 0) {
      let nearest = null;
      let minDist = Infinity;

      remainingBins.forEach(bin => {
        const dist = Math.sqrt(
          Math.pow(bin.coordinates.lat - currentPos[0], 2) +
          Math.pow(bin.coordinates.lng - currentPos[1], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = bin;
        }
      });

      if (nearest) {
        route.push([nearest.coordinates.lat, nearest.coordinates.lng]);
        currentPos = [nearest.coordinates.lat, nearest.coordinates.lng];
        remainingBins = remainingBins.filter(b => b.binId !== nearest.binId);
      }
    }

    setRoutePoints(route);
  };

  const createCustomIcon = (status) => {
    const colors = {
      critical: '#ef4444',
      warning: '#eab308',
      normal: '#22c55e'
    };

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${colors[status] || colors.normal};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2Z"/>
        </svg>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

return (
    <div className="space-y-6">
      {/* DEBUG */}
      <div className="bg-yellow-500 text-black p-4 rounded-lg">
        <div>DEBUG INFO:</div>
        <div>Bins count: {bins.length}</div>
        <div>Bins: {JSON.stringify(bins.slice(0, 2))}</div>
      </div>

      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Map View</h2>
            <p className="text-slate-400">Real-time bin locations and routes</p>
          </div>
        </div>
        <button
          onClick={() => setRouteMode(!routeMode)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            routeMode 
              ? 'bg-emerald-500 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Navigation className="w-4 h-4" />
          {routeMode ? 'Hide Route' : 'Show Optimal Route'}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
          <div className="text-sm text-slate-400">Total Bins</div>
          <div className="text-2xl font-bold">{bins.length}</div>
        </div>
        <div className="bg-slate-800 border border-red-700 rounded-lg p-3">
          <div className="text-sm text-slate-400">Critical</div>
          <div className="text-2xl font-bold text-red-500">
            {bins.filter(b => b.status === 'critical').length}
          </div>
        </div>
        <div className="bg-slate-800 border border-yellow-700 rounded-lg p-3">
          <div className="text-sm text-slate-400">Warning</div>
          <div className="text-2xl font-bold text-yellow-500">
            {bins.filter(b => b.status === 'warning').length}
          </div>
        </div>
        <div className="bg-slate-800 border border-green-700 rounded-lg p-3">
          <div className="text-sm text-slate-400">Normal</div>
          <div className="text-2xl font-bold text-green-500">
            {bins.filter(b => b.status === 'normal').length}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={centerPosition}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Bin Markers */}
          {bins.map(bin => (
            <Marker
              key={bin.binId}
              position={[bin.coordinates.lat, bin.coordinates.lng]}
              icon={createCustomIcon(bin.status)}
              eventHandlers={{
                click: () => setSelectedBin(bin)
              }}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold text-lg mb-2">{bin.binId}</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Location:</strong> {bin.location}</div>
                    <div><strong>Fill Level:</strong> <span className={getStatusColor(bin.status)}>{bin.fillLevel}%</span></div>
                    <div><strong>Status:</strong> <span className={getStatusColor(bin.status)}>{bin.status.toUpperCase()}</span></div>
                    <div><strong>Battery:</strong> {bin.battery}%</div>
                    <div><strong>Temperature:</strong> {bin.temperature}°C</div>
                  </div>
                </div>
              </Popup>

              {/* Visual range indicator */}
              <Circle
                center={[bin.coordinates.lat, bin.coordinates.lng]}
                radius={100}
                pathOptions={{
                  color: bin.status === 'critical' ? '#ef4444' : bin.status === 'warning' ? '#eab308' : '#22c55e',
                  fillColor: bin.status === 'critical' ? '#ef4444' : bin.status === 'warning' ? '#eab308' : '#22c55e',
                  fillOpacity: 0.1,
                  weight: 1
                }}
              />
            </Marker>
          ))}

          {/* Optimal Route */}
          {routeMode && routePoints.length > 0 && (
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: '#3b82f6',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="font-bold mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-slate-300">Critical (≥80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-slate-300">Warning (≥60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-slate-300">Normal (&lt;60%)</span>
          </div>
          {routeMode && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500" style={{ borderTop: '2px dashed #3b82f6' }}></div>
              <span className="text-sm text-slate-300">Optimal Route</span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Bin Details */}
      {selectedBin && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Selected Bin Details</h3>
            <button
              onClick={() => setSelectedBin(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-400">Bin ID</div>
              <div className="text-lg font-bold">{selectedBin.binId}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Location</div>
              <div className="text-lg font-bold">{selectedBin.location}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Fill Level</div>
              <div className={`text-lg font-bold ${getStatusColor(selectedBin.status)}`}>
                {selectedBin.fillLevel}%
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Status</div>
              <div className={`text-lg font-bold ${getStatusColor(selectedBin.status)}`}>
                {selectedBin.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;