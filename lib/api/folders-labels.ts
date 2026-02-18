import { apiClient } from './client';

export interface Folder {
  _id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Label {
  _id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

// Folders
export const listFolders = async () => {
  const response = await apiClient.get('/folders');
  return response.data;
};

export const createFolder = async (data: { name: string; color?: string; icon?: string }) => {
  const response = await apiClient.post('/folders', data);
  return response.data;
};

// Labels
export const listLabels = async () => {
  const response = await apiClient.get('/labels');
  return response.data;
};

export const createLabel = async (data: { name: string; color?: string }) => {
  const response = await apiClient.post('/labels', data);
  return response.data;
};
