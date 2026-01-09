/**
 * Converts a data URL to a Blob object.
 * @param {string} dataurl - The data URL to convert.
 * @returns {Blob} - The resulting Blob.
 */
export const dataURLtoBlob = (dataurl) => {
    if (!dataurl || !dataurl.includes(',')) return null;
    try {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.error("Error converting dataURL to blob:", e);
        return null;
    }
};

/**
 * Generates a thumbnail for a video URL by capturing a frame at a specific time.
 * @param {string} videoUrl - The URL of the video.
 * @param {number} seekTime - The time in seconds to capture the frame (default 1).
 * @returns {Promise<string>} - A promise that resolves to a data URL of the captured frame.
 */
export const generateVideoThumbnail = (videoUrl, seekTime = 1) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');

        // Critical for cross-origin videos to allow canvas extraction
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';

        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Thumbnail generation timed out (8s). The video server might be blocking access (CORS).'));
        }, 8000);

        const cleanup = () => {
            clearTimeout(timeout);
            video.onloadedmetadata = null;
            video.onseeked = null;
            video.onerror = null;
            video.src = "";
            video.load();
        };

        const captureFrame = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                if (canvas.width === 0 || canvas.height === 0) {
                    // Try waiting a bit more or retry
                    return false;
                }

                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                cleanup();
                resolve(thumbnailUrl);
                return true;
            } catch (err) {
                cleanup();
                if (err.name === 'SecurityError') {
                    reject(new Error('CORS Error: Cannot capture frame from this video source.'));
                } else {
                    reject(err);
                }
                return true;
            }
        };

        video.onloadedmetadata = () => {
            video.currentTime = Math.max(0, Math.min(seekTime, video.duration || seekTime));
        };

        video.onseeked = () => {
            // Give it a tiny bit of time to render the frame
            setTimeout(captureFrame, 100);
        };

        video.onerror = (e) => {
            cleanup();
            console.error("Video element error for URL:", videoUrl, video.error);
            const errorMsg = video.error?.code === 4
                ? "Format not supported or access denied by CORS."
                : (video.error?.message || 'Unknown error');
            reject(new Error(`Video load error: ${errorMsg}`));
        };

        // If the URL is a Discord link, we might need to handle specific behaviors
        // but for now, we just set the src and hope for the best.
        video.src = videoUrl;
        video.load();
    });
};
