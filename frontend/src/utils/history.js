import api from './api';
import { getAuthHeaders } from './auth';

export const trackHistory = async ({ detectedEmotion, finalEmotion, songUrl, action }) => {
  const headers = getAuthHeaders();
  if (!headers.Authorization || !action) {
    return;
  }

  try {
    await api.post(
      '/user/history',
      {
        detected_emotion: detectedEmotion,
        final_emotion: finalEmotion,
        song_url: songUrl,
        action,
      },
      { headers }
    );
  } catch {
  }
};
