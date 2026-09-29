/**
 * Client-side wallpaper download helper that guarantees downloads are saved in PNG format.
 */

export async function downloadWallpaperAsPng(
  imageUrl: string,
  suggestedFilename: string
): Promise<void> {
  // Ensure filename ends with .png
  const filename = suggestedFilename.replace(/\.[a-zA-Z0-9]+$/, '') + '.png';

  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const sourceBlob = await response.blob();

    // If the server already sent image/png, download directly
    if (sourceBlob.type === 'image/png') {
      triggerDownload(sourceBlob, filename);
      return;
    }

    // Convert blob to true PNG via canvas
    const pngBlob = await convertBlobToPng(sourceBlob);
    if (pngBlob) {
      triggerDownload(pngBlob, filename);
      return;
    }

    // Fallback: force PNG mime-type on blob
    const forcedPngBlob = new Blob([sourceBlob], { type: 'image/png' });
    triggerDownload(forcedPngBlob, filename);
  } catch (error) {
    console.warn('[DownloadHelper] Standard fetch failed, fallback to direct anchor:', error);
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  }, 200);
}

function convertBlobToPng(sourceBlob: Blob): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const objectUrl = window.URL.createObjectURL(sourceBlob);

      img.onload = () => {
        window.URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };

      img.onerror = () => {
        window.URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      img.src = objectUrl;
    } catch {
      resolve(null);
    }
  });
}
