import React from 'react';
import { AnalysisResult, VideoAnalysisResult } from './types';
import { exportAnalysis } from './api';

interface AnalysisResultsProps {
  realtimeResult?: AnalysisResult;
  videoResult?: VideoAnalysisResult;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ realtimeResult, videoResult }) => {
  const handleExport = async () => {
    try {
      const dataToExport = {
        realtimeResult,
        videoResult,
        exportedAt: new Date().toISOString(),
      };
      
      const exportResult = await exportAnalysis(dataToExport);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportResult, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `posture-analysis-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting analysis:', error);
      alert('Error exporting analysis. Please try again.');
    }
  };

  const renderPostureIssues = (issues: string[]) => {
    if (issues.length === 0) {
      return (
        <div className="posture-status good">
          <span className="status-icon">✓</span>
          <span>Good posture detected!</span>
        </div>
      );
    }

    return (
      <div className="posture-status bad">
        <span className="status-icon">⚠</span>
        <div className="issues-list">
          <h4>Posture Issues:</h4>
          <ul>
            {issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderAngles = (angles: { [key: string]: number }) => {
    if (Object.keys(angles).length === 0) return null;

    return (
      <div className="angles-info">
        <h4>Angle Measurements:</h4>
        <div className="angles-grid">
          {Object.entries(angles).map(([key, value]) => (
            <div key={key} className="angle-item">
              <span className="angle-label">{key.replace('_', ' ').toUpperCase()}:</span>
              <span className="angle-value">{value.toFixed(1)}°</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVideoSummary = (summary: VideoAnalysisResult['summary']) => {
    const scoreColor = summary.posture_score >= 70 ? 'good' : 
                      summary.posture_score >= 40 ? 'warning' : 'bad';

    return (
      <div className="video-summary">
        <h3>Video Analysis Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Frames:</span>
            <span className="summary-value">{summary.total_frames_analyzed}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Good Posture:</span>
            <span className="summary-value">{summary.good_posture_frames}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Bad Posture:</span>
            <span className="summary-value">{summary.bad_posture_frames}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Posture Score:</span>
            <span className={`summary-value score-${scoreColor}`}>
              {summary.posture_score.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="analysis-results">
      <div className="results-header">
        <h2>Analysis Results</h2>
        {(realtimeResult || videoResult) && (
          <button onClick={handleExport} className="btn btn-secondary">
            Export Results
          </button>
        )}
      </div>

      {/* Real-time Analysis Results */}
      {realtimeResult && (
        <div className="realtime-results">
          <h3>Real-time Analysis</h3>
          {realtimeResult.error ? (
            <div className="error-message">
              <span className="error-icon">❌</span>
              <span>{realtimeResult.error}</span>
            </div>
          ) : realtimeResult.analysis ? (
            <div className="analysis-content">
              <div className="posture-type">
                <strong>Mode:</strong> {realtimeResult.analysis.posture_type.toUpperCase()}
              </div>
              
              {renderPostureIssues(realtimeResult.analysis.issues)}
              {renderAngles(realtimeResult.analysis.angles)}
              
              {realtimeResult.timestamp && (
                <div className="timestamp">
                  <small>Last updated: {new Date(realtimeResult.timestamp * 1000).toLocaleTimeString()}</small>
                </div>
              )}
            </div>
          ) : (
            <div className="no-analysis">
              <span>No pose detected. Make sure you're visible in the camera.</span>
            </div>
          )}
        </div>
      )}

      {/* Video Analysis Results */}
      {videoResult && (
        <div className="video-results">
          {renderVideoSummary(videoResult.summary)}
          
          <div className="frame-results">
            <h4>Frame-by-Frame Analysis</h4>
            <div className="frames-timeline">
              {videoResult.frame_results.slice(0, 20).map((frame, index) => (
                <div 
                  key={index} 
                  className={`frame-indicator ${frame.analysis?.is_good_posture ? 'good' : 'bad'}`}
                  title={`Frame ${frame.frame_number}: ${frame.analysis?.is_good_posture ? 'Good' : 'Bad'} posture`}
                >
                  <div className="frame-number">{frame.frame_number || index}</div>
                </div>
              ))}
              {videoResult.frame_results.length > 20 && (
                <div className="more-frames">+{videoResult.frame_results.length - 20} more</div>
              )}
            </div>
          </div>

          {/* Show detailed analysis for the last frame */}
          {videoResult.frame_results.length > 0 && (
            <div className="last-frame-analysis">
              <h4>Latest Frame Analysis</h4>
              {(() => {
                const lastFrame = videoResult.frame_results[videoResult.frame_results.length - 1];
                return lastFrame.analysis ? (
                  <div className="analysis-content">
                    {renderPostureIssues(lastFrame.analysis.issues)}
                    {renderAngles(lastFrame.analysis.angles)}
                  </div>
                ) : (
                  <div className="no-analysis">No pose detected in this frame</div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!realtimeResult && !videoResult && (
        <div className="no-results">
          <div className="no-results-content">
            <h3>No Analysis Results</h3>
            <p>Start webcam analysis or upload a video to see results here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
