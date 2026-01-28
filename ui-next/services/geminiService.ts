/**
 * Sleep Insights Generator
 * Simple rule-based insights (no AI API needed)
 */
import { SleepData } from '../types';

export const generateSleepInsights = async (todaySleep: SleepData): Promise<string> => {
  const { score, remScore, deepScore, durationHours } = todaySleep;
  
  // Rule-based insights
  if (score >= 90) {
    return `Outstanding sleep quality (${score}/100)! Your REM at ${remScore}% is excellent for memory consolidation. Keep this routine!`;
  }
  
  if (score >= 80) {
    return `Great sleep (${score}/100)! Your ${durationHours}h duration is solid. Maintain this consistency for optimal recovery.`;
  }
  
  if (score >= 70) {
    return `Good sleep (${score}/100). Consider optimizing your ${remScore < 70 ? 'REM cycles' : 'deep sleep'} for better restoration.`;
  }
  
  if (score >= 60) {
    return `Fair sleep (${score}/100). Focus on ${durationHours < 7 ? 'getting more hours' : 'improving sleep efficiency'} tonight.`;
  }
  
  return `Sleep needs improvement (${score}/100). Try setting a consistent bedtime and optimizing your sleep environment.`;
};
