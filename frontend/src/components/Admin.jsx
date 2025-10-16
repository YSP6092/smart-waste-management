import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash, Download, CheckCircle, MapPin } from 'lucide-react';
import axios from 'axios';

// ✅ Automatically switch between local and deployed backend
const API_URL = import.meta.env.VITE_API_URL || 'https://smart-waste-management.onrender.com';

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

  const handleAddBin = async () => {
    try {
      const newBin = {
        binId: formData.binId,
        location: formData.location,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        status: 'Empty'
      };
      await axios.post(`${API_URL}/api/bins`, newBin);
      onRefresh();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding bin:', error);
    }
  };

  const handleEditBin = async () => {
    try {
      await axios.put(`${API_URL}/api/bins/${selectedBin.binId}`, {
        location: formData.location,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      });
      onRefresh();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error editing bin:', error);
    }
  };

  const handleDeleteBin = async (binId) => {
    try {
      await axios.delete(`${API_URL}/api/bins/${binId}`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting bin:', error);
    }
  };

  const handleMarkCollected = async (bin) => {
    try {
      await axios.put(`${API_URL}/api/bins/${bin.binId}`, { status: 'Empty' });
      onRefresh();
    } catch (error) {
      console.error('Error marking collected:', error);
    }
  };

  const handleUpdateLocations = async () => {
    try {
      await axios.post(`${API_URL}/api/bins/update-locations`);
      onRefresh();
    } catch (error) {
      console.error('Error updating locations:', error);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Bin ID', 'Location', 'Latitude', 'Longitude', 'Status'],
      ...bins.map(bin => [bin.binId, bin.location, bin.lat, bin.lng, bin.status])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bins_data.csv';
    link.click();
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-green-600" /> Admin Dashboard
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} /> Add Bin
          </button>
          <button
            onClick={exportData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
        <thead className="bg-green-50 text-green-700">
          <tr>
            <th className="p-3 text-left">Bin ID</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-left">Latitude</th>
            <th className="p-3 text-left">Longitude</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((bin) => (
            <tr key={bin.binId} className="border-t hover:bg-gray-50">
              <td className="p-3">{bin.binId}</td>
              <td className="p-3">{bin.location}</td>
              <td className="p-3">{bin.lat}</td>
              <td className="p-3">{bin.lng}</td>
              <td className={`p-3 font-medium ${bin.status === 'Full' ? 'text-red-600' : 'text-green-600'}`}>
                {bin.status}
              </td>
              <td className="p-3 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedBin(bin);
                    setFormData({
                      binId: bin.binId,
                      location: bin.location,
                      lat: bin.lat,
                      lng: bin.lng
                    });
                    setShowEditModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteBin(bin.binId)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={18} />
                </button>
                {bin.status === 'Full' && (
                  <button
                    onClick={() => handleMarkCollected(bin)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl p-6 w-[400px] space-y-4">
            <h3 className="text-xl font-semibold text-center">
              {showAddModal ? 'Add New Bin' : 'Edit Bin'}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Bin ID"
                value={formData.binId}
                onChange={(e) => setFormData({ ...formData, binId: e.target.value })}
                disabled={showEditModal}
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border p-2 rounded-lg"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Latitude"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="w-1/2 border p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  className="w-1/2 border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleAddBin : handleEditBin}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
              >
                {showAddModal ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;