
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

export class ApiService {
  static async uploadExcel(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-excel`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  static async processSheet(file: File, sheetName: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheet_name', sheetName);

    try {
      const response = await fetch(`${API_BASE_URL}/process-sheet`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Processing failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Processing error:', error);
      throw error;
    }
  }

  static async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}
