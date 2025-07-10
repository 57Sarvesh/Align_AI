import axios from 'axios';
import { AnalysisResult, VideoAnalysisResult } from './types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const analyzeFrame = async (
  imageData: string,
  postureType: 'sitting' | 'squat' = 'sitting'
): Promise<AnalysisResult> => {
  try {
    const response = await api.post('/analyze-frame', {
      image_data: imageData,
      posture_type: postureType,
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing frame:', error);
    throw error;
  }
};

export const analyzeVideo = async (
  videoFile: File,
  postureType: 'sitting' | 'squat' = 'sitting'
): Promise<VideoAnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('posture_type', postureType);

    const response = await api.post('/analyze-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing video:', error);
    throw error;
  }
};

export const exportAnalysis = async (analysisData: any): Promise<any> => {
  try {
    const response = await api.post('/export-analysis', analysisData);
    return response.data;
  } catch (error) {
    console.error('Error exporting analysis:', error);
    throw error;
  }
};

export const checkHealth = async (): Promise<{ status: string; timestamp: number }> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export class WebSocketService {
  private ws: WebSocket | null = null;
  private onMessage: ((message: any) => void) | null = null;

  connect(onMessage: (message: any) => void): void {
    this.onMessage = onMessage;
    this.ws = new WebSocket('ws://localhost:8000/ws');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (this.onMessage) {
        this.onMessage(message);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendFrame(imageData: string, postureType: 'sitting' | 'squat' = 'sitting'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'frame',
        image: imageData,
        posture_type: postureType,
      }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
