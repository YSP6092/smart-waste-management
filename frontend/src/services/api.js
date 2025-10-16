import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const getBins = async () => {
  try {
    const response = await axios.get(`${API_URL}/bins`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bins:', error);
    return [];
  }
};

export const getHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health:', error);
    return null;
  }
};