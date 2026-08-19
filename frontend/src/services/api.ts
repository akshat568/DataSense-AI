import axios from 'axios';

// Ensure the environment variable is loaded (Vite uses import.meta.env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We don't set Content-Type to application/json for multipart/form-data
// Axios will automatically set the correct headers (including boundary) when we pass FormData
export const uploadDataset = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const generateDatasetProfile = async (file: File | null, sessionId?: string) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (sessionId) formData.append('session_id', sessionId);

  const response = await apiClient.post('/api/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const generateRecommendations = async (file: File | null, sessionId?: string) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (sessionId) formData.append('session_id', sessionId);

  const response = await apiClient.post('/api/recommendation', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const trainBaselineModels = async (sessionId: string) => {
  const response = await apiClient.post('/api/train', { session_id: sessionId });
  return response.data;
};

export const getGlobalExplanations = async (sessionId: string) => {
  const response = await apiClient.post('/api/explainability/global', { session_id: sessionId });
  return response.data;
};

export const getLocalExplanation = async (sessionId: string, rowIndex: number) => {
  const response = await apiClient.post('/api/explainability/local', { session_id: sessionId, row_index: rowIndex });
  return response.data;
};

export const getReportPreview = async (sessionId: string) => {
  const response = await apiClient.get(`/api/report/preview?session_id=${sessionId}`);
  return response.data;
};

export const downloadReport = async (sessionId: string, format: 'pdf' | 'html') => {
  const response = await apiClient.get(`/api/report/export?session_id=${sessionId}&format=${format}`, {
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `DataSense_Report_${sessionId.substring(0,8)}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
