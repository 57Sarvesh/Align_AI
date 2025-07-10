export interface Keypoints {
  nose: [number, number];
  left_shoulder: [number, number];
  right_shoulder: [number, number];
  left_hip: [number, number];
  right_hip: [number, number];
  left_knee: [number, number];
  right_knee: [number, number];
  left_ankle: [number, number];
  right_ankle: [number, number];
  left_foot_index: [number, number];
  right_foot_index: [number, number];
}

export interface PostureAnalysis {
  posture_type: 'sitting' | 'squat';
  issues: string[];
  angles: {
    [key: string]: number;
  };
  is_good_posture: boolean;
}

export interface AnalysisResult {
  keypoints: Keypoints | null;
  analysis: PostureAnalysis | null;
  timestamp: number | null;
  error?: string;
}

export interface VideoAnalysisSummary {
  total_frames_analyzed: number;
  good_posture_frames: number;
  bad_posture_frames: number;
  posture_score: number;
  posture_type: string;
}

export interface VideoAnalysisResult {
  summary: VideoAnalysisSummary;
  frame_results: AnalysisResult[];
}

export interface WebSocketMessage {
  type: 'analysis' | 'error';
  data?: AnalysisResult;
  message?: string;
}
