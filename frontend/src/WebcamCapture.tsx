import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { WebSocketService } from './api';
import { AnalysisResult, WebSocketMessage } from './types';

interface WebcamCaptureProps {
  postureType: 'sitting' | 'squat';
  onAnalysisResult: (result: AnalysisResult) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ postureType, onAnalysisResult }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'connecting'>('disconnected');
  const wsService = useRef<WebSocketService | null>(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'analysis' && message.data) {
      onAnalysisResult(message.data);
    } else if (message.type === 'error') {
      console.error('WebSocket error:', message.message);
    }
  }, [onAnalysisResult]);

  const startCapture = useCallback(() => {
    if (!wsService.current) {
      wsService.current = new WebSocketService();
    }
    
    setConnectionStatus('connecting');
    wsService.current.connect(handleWebSocketMessage);
    
    setIsCapturing(true);
    setConnectionStatus('connected');
  }, [handleWebSocketMessage]);

  const stopCapture = useCallback(() => {
    setIsCapturing(false);
    if (wsService.current) {
      wsService.current.disconnect();
      wsService.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  const captureFrame = useCallback(() => {
    if (webcamRef.current && wsService.current && isCapturing) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        wsService.current.sendFrame(imageSrc, postureType);
      }
    }
  }, [isCapturing, postureType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCapturing) {
      // Capture frame every 500ms for real-time analysis
      interval = setInterval(captureFrame, 500);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCapturing, captureFrame]);

  useEffect(() => {
    return () => {
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="webcam-container">
      <div className="webcam-header">
        <h3>Live Webcam Feed</h3>
        <div className="connection-status">
          Status: 
          <span className={`status-indicator ${connectionStatus}`}>
            {connectionStatus === 'connected' ? ' Connected' : 
             connectionStatus === 'connecting' ? ' Connecting...' : ' Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="webcam-wrapper">
        <Webcam
          ref={webcamRef}
          audio={false}
          height={480}
          width={640}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="webcam-video"
        />
      </div>
      
      <div className="webcam-controls">
        {!isCapturing ? (
          <button onClick={startCapture} className="btn btn-primary">
            Start Analysis
          </button>
        ) : (
          <button onClick={stopCapture} className="btn btn-secondary">
            Stop Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
