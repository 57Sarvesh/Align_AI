import React, { useState, useRef } from 'react';
import { analyzeVideo } from './api';
import { VideoAnalysisResult } from './types';

interface VideoUploadProps {
  postureType: 'sitting' | 'squat';
  onAnalysisResult: (result: VideoAnalysisResult) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ postureType, onAnalysisResult }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is a video
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
      } else {
        alert('Please select a video file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a video file first');
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const result = await analyzeVideo(selectedFile, postureType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onAnalysisResult(result);
      
    } catch (error) {
      console.error('Error analyzing video:', error);
      alert('Error analyzing video. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="video-upload-container">
      <h3>Video Upload</h3>
      
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="file-input"
            id="video-upload"
          />
          <label htmlFor="video-upload" className="file-input-label">
            {selectedFile ? 'Change Video' : 'Select Video File'}
          </label>
        </div>

        {selectedFile && (
          <div className="file-info">
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{formatFileSize(selectedFile.size)}</span>
            </div>
            <button onClick={clearFile} className="btn btn-small btn-secondary">
              Remove
            </button>
          </div>
        )}

        <div className="upload-controls">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isAnalyzing}
            className="btn btn-primary"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
          </button>
        </div>

        {isAnalyzing && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}
      </div>

      <div className="upload-info">
        <h4>Supported formats:</h4>
        <ul>
          <li>MP4 (.mp4)</li>
          <li>AVI (.avi)</li>
          <li>MOV (.mov)</li>
          <li>WebM (.webm)</li>
        </ul>
        <p className="note">
          Note: For best results, ensure the person is clearly visible in the video
          and the lighting is adequate.
        </p>
      </div>
    </div>
  );
};

export default VideoUpload;
