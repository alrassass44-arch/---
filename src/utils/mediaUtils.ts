/**
 * Media & Thumbnail Utilities for Dewan Al Saada
 * Ensures no video is ever without a picture/frame by utilizing multi-tier fallbacks,
 * including direct YouTube video frame captures (0.jpg, hqdefault, mqdefault).
 */

export function getVideoThumbnail(video: {
  thumbnail?: string;
  thumbnailUrl?: string;
  youtubeId?: string;
}): string {
  if (video.thumbnail && video.thumbnail.trim().length > 0) {
    // If it was maxresdefault, convert to hqdefault for guaranteed 200 OK
    if (video.thumbnail.includes('maxresdefault.jpg')) {
      return video.thumbnail.replace('maxresdefault.jpg', 'hqdefault.jpg');
    }
    return video.thumbnail;
  }
  if (video.thumbnailUrl && video.thumbnailUrl.trim().length > 0) {
    if (video.thumbnailUrl.includes('maxresdefault.jpg')) {
      return video.thumbnailUrl.replace('maxresdefault.jpg', 'hqdefault.jpg');
    }
    return video.thumbnailUrl;
  }
  if (video.youtubeId) {
    return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
  }
  return '/channel-logo.jpg';
}

/**
 * Robust onError handler for HTML <img> elements displaying video frames
 * Progressively falls back from HQ to direct video frame (0.jpg), then MQ, then channel logo
 */
export function handleVideoThumbnailError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  youtubeId?: string
): void {
  const img = e.currentTarget;

  if (youtubeId) {
    if (!img.dataset.fallbackLevel || img.dataset.fallbackLevel === '0') {
      img.dataset.fallbackLevel = '1';
      img.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      return;
    }
    if (img.dataset.fallbackLevel === '1') {
      // Direct frame capture from inside the video itself
      img.dataset.fallbackLevel = '2';
      img.src = `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
      return;
    }
    if (img.dataset.fallbackLevel === '2') {
      img.dataset.fallbackLevel = '3';
      img.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      return;
    }
  }

  // Final fallback to channel logo
  img.src = '/channel-logo.jpg';
}
