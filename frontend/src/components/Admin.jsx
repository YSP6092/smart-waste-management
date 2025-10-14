import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash, Download, CheckCircle, MapPin } from 'lucide-react';
import axios from 'axios';

const Admin = ({ bins, onRefresh }) => {
const [showAddModal, setShowAddModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [selectedBin, setSelectedBin] = useState(null);
const [searchingLocation, setSearchingLocation] = useState(false);
const [locationSuggestions, setLocationSuggestions] = useState([]);
const [formData, setFormData] = useState({
  binId: '',
  location: '',
  lat: '',
  lng: ''
});

  const handleAddBin = async (e) => {
    e.preventDefault();
    
    const newBin = {
      binId: formData.binId,
      location: formData.location,
      coordinates: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      },
      fillLevel: 0,
      battery: 100,
      temperature: 25,
      status: 'normal'
    };

    try {
      await axios.post('http://localhost:5001/api/bins', newBin);
      alert('Bin added successfully!');
      setShowAddModal(false);
      setFormData({ binId: '', location: '', lat: '', lng: '' });
      if (onRefresh) onRefresh();
    } catch (error) {
      alert('Error adding bin: ' + error.message);
    }
  };

  const handleEditBin = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`http://localhost:5001/api/bins/${selectedBin.binId}`, {
        location: formData.location,
        coordinates: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        }
      });
      alert('Bin updated successfully!');
      setShowEditModal(false);
      setSelectedBin(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      alert('Error updating bin: ' + error.message);
    }
  };

  const handleDeleteBin = async (binId) => {
    if (!window.confirm('Are you sure you want to delete this bin?')) return;
    
    try {
      await axios.delete(`http://localhost:5001/api/bins/${binId}`);
      alert('Bin deleted successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      alert('Error deleting bin: ' + error.message);
    }
  };
  // Search location using OpenStreetMap
const searchLocation = async (query) => {
  if (query.length < 3) {
    setLocationSuggestions([]);
    return;
  }
  
  setSearchingLocation(true);
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Nagpur, India')}&limit=5`
    );
    setLocationSuggestions(response.data);
  } catch (error) {
    console.error('Error searching location:', error);
    setLocationSuggestions([]);
  }
  setSearchingLocation(false);
};

// Select location from suggestions
const selectLocation = (suggestion) => {
  setFormData({
    ...formData,
    location: suggestion.display_name.split(',')[0], // First part of address
    lat: suggestion.lat,
    lng: suggestion.lon
  });
  setLocationSuggestions([]);
};

// Debounce search
let searchTimeout;
const handleLocationSearch = (value) => {
  setFormData({ ...formData, location: value });
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchLocation(value);
  }, 500);
};

  const handleRecordCollection = async (bin) => {
    if (!window.confirm(`Record collection for ${bin.binId}?`)) return;

    try {
      await axios.put(`http://localhost:5001/api/bins/${bin.binId}`, {
        fillLevel: 0,
        status: 'normal'
      });
      alert('Collection recorded!');
      if (onRefresh) onRefresh();
    } catch (error) {
      alert('Error recording collection: ' + error.message);
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ['Bin ID', 'Location', 'Fill Level', 'Status', 'Battery', 'Temperature', 'Latitude', 'Longitude'],
      ...bins.map(bin => [
        bin.binId,
        bin.location,
        bin.fillLevel,
        bin.status,
        bin.battery,
        bin.temperature,
        bin.coordinates.lat,
        bin.coordinates.lng
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-management-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
const handleUpdateLocations = async () => {
  if (!window.confirm('Update all bins with real location names from coordinates? This may take 10-15 seconds.')) return;

  try {
    const response = await axios.post('http://localhost:5001/api/bins/update-locations');
    alert(response.data.message);
    if (onRefresh) onRefresh();
  } catch (error) {
    alert('Error updating locations: ' + error.message);
  }
};
  const openEditModal = (bin) => {
    setSelectedBin(bin);
    setFormData({
      binId: bin.binId,
      location: bin.location,
      lat: bin.coordinates.lat.toString(),
      lng: bin.coordinates.lng.toString()
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500 p-3 rounded-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="text-slate-400">Manage bins and system settings</p>
          </div>
        </div>

       <div className="flex gap-3">
  <button
    onClick={handleUpdateLocations}
    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg flex items-center gap-2 transition-all"
  >
    <MapPin className="w-4 h-4" />
    Update Locations
  </button>
  <button
    onClick={handleExportData}
    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-all"
  >
    <Download className="w-4 h-4" />
    Export Data
  </button>
  <button
    onClick={() => setShowAddModal(true)}
    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center gap-2 transition-all"
  >
    <Plus className="w-4 h-4" />
    Add New Bin
  </button>
</div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400">Total Bins</div>
          <div className="text-3xl font-bold">{bins.length}</div>
        </div>
        <div className="bg-slate-800 border border-red-700 rounded-lg p-4">
          <div className="text-sm text-slate-400">Need Collection</div>
          <div className="text-3xl font-bold text-red-500">
            {bins.filter(b => b.status === 'critical').length}
          </div>
        </div>
        <div className="bg-slate-800 border border-green-700 rounded-lg p-4">
          <div className="text-sm text-slate-400">Optimal Status</div>
          <div className="text-3xl font-bold text-green-500">
            {bins.filter(b => b.status === 'normal').length}
          </div>
        </div>
        <div className="bg-slate-800 border border-blue-700 rounded-lg p-4">
          <div className="text-sm text-slate-400">Avg Fill Level</div>
          <div className="text-3xl font-bold text-blue-500">
            {bins.length > 0 ? (bins.reduce((acc, b) => acc + b.fillLevel, 0) / bins.length).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Bins Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold">Bin Management</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Bin ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Location</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Fill Level</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Battery</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bins.map((bin, idx) => (
                <tr key={idx} className="border-t border-slate-700 hover:bg-slate-900 transition-colors">
                  <td className="p-4 font-semibold">{bin.binId}</td>
                  <td className="p-4 text-slate-300">{bin.location}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            bin.status === 'critical' ? 'bg-red-500' :
                            bin.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${bin.fillLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{bin.fillLevel}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bin.status === 'critical' ? 'bg-red-500' :
                      bin.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {bin.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{bin.battery}%</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRecordCollection(bin)}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded transition-all"
                        title="Record Collection"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(bin)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBin(bin.binId)}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded transition-all"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bin Modal */}
      {/* Add Bin Modal */}
{showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">Add New Bin</h3>
      <form onSubmit={handleAddBin} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Bin ID</label>
          <input
            type="text"
            required
            value={formData.binId}
            onChange={(e) => setFormData({...formData, binId: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
            placeholder="e.g., BIN011"
          />
        </div>

        {/* Location Search */}
        <div className="relative">
          <label className="block text-sm text-slate-400 mb-1">
            Search Location (City: Nagpur)
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => handleLocationSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
            placeholder="e.g., Sitabuldi, Railway Station, Airport"
          />
          
          {/* Location Suggestions Dropdown */}
          {locationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {locationSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectLocation(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-700 last:border-b-0 transition-colors"
                >
                  <div className="font-semibold text-sm text-white">
                    {suggestion.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {suggestion.display_name}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {searchingLocation && (
            <div className="text-xs text-slate-400 mt-1">Searching locations...</div>
          )}
        </div>

        {/* Manual Coordinates (Auto-filled from search) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Latitude {formData.lat && '✓'}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={formData.lat}
              onChange={(e) => setFormData({...formData, lat: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
              placeholder="21.1458"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Longitude {formData.lng && '✓'}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={formData.lng}
              onChange={(e) => setFormData({...formData, lng: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
              placeholder="79.0882"
            />
          </div>
        </div>

        {formData.lat && formData.lng && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 text-sm">
            <div className="text-emerald-500 font-semibold mb-1">📍 Location Found!</div>
            <div className="text-slate-300">
              {formData.location || 'Location selected'}
              <br />
              <span className="text-xs text-slate-400">
                Coordinates: {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded transition-all"
          >
            Add Bin
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddModal(false);
              setLocationSuggestions([]);
              setFormData({ binId: '', location: '', lat: '', lng: '' });
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      {/* Edit Bin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Edit Bin: {selectedBin?.binId}</h3>
            <form onSubmit={handleEditBin} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData({...formData, lng: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-all"
                >
                  Update Bin
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;