
import axios from 'axios';

export interface ProcessedData {
  [key: string]: string | number;
}

export interface ApiResponse {
  success: boolean;
  data?: ProcessedData[];
  columns?: string[];
  fileName?: string;
  multipleSheets?: boolean;
  sheets?: string[];
  error?: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export class ApiService {
  static async uploadExcel(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/upload-excel', formData);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || 'Upload failed');
      }
      throw new Error('Network error: Unable to connect to backend');
    }
  }

  static async processSheet(file: File, sheetName: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheet_name', sheetName);

    try {
      const response = await apiClient.post('/process-sheet', formData);
      return response.data;
    } catch (error) {
      console.error('Processing error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || 'Processing failed');
      }
      throw new Error('Network error: Unable to connect to backend');
    }
  }

  static async healthCheck(): Promise<{ status: string; message?: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend service unavailable');
    }
  }
}
