/**
 * Generates a thumbnail for a video URL by capturing a frame at a specific time.
 * @param {string} videoUrl - The URL of the video.
 * @param {number} seekTime - The time in seconds to capture the frame (default 1).
 * @returns {Promise<string>} - A promise that resolves to a data URL of the captured frame.
 */
export const generateVideoThumbnail = (videoUrl, seekTime = 1) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.crossOrigin = 'anonymous'; // This is crucial for cross-origin URLs
        video.muted = true;
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            // Seek to the desired time
            video.currentTime = Math.min(seekTime, video.duration);
        };

        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);

                // Clean up
                video.src = "";
                video.load();

                resolve(thumbnailUrl);
            } catch (err) {
                reject(err);
            }
        };

        video.onerror = (err) => {
            reject(err);
        };

        // If the video can't seek or load, timeout after 5 seconds
        setTimeout(() => {
            reject(new Error('Thumbnail generation timed out'));
        }, 5000);
    });
};
