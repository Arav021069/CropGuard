// src/api/validatePlantImage.js
//
// Runs BEFORE diagnosePlant() is ever called (see LoadingScreen.jsx).
// This is a dedicated gate — an image is never assumed to be a plant just
// because a disease classifier happened to return a label for it.
//
// --- Real backend integration (preferred) ---
// Set VITE_PLANT_VALIDATION_API_URL in .env.local to a real plant/leaf
// classifier endpoint and this file automatically calls it instead of the
// heuristic below — no other code needs to change.
//   Expected response shape:
//   { isPlant: boolean, confidence: number (0-1), reason?: string }
//
// If your diagnosis backend (VITE_DIAGNOSE_API_URL) already returns a
// plant/leaf signal as part of ITS response (e.g. `is_plant: false` when
// it can't classify the image), diagnoseApi.js already treats that the
// same way a failed validation here is treated — see the comment in
// diagnoseApi.js's response handling. That means if your backend does
// both jobs in one call, you don't need to duplicate a second request.
//
// --- Fallback (no real validation endpoint configured yet) ---
// A lightweight, CLEARLY-LABELED client-side heuristic runs entirely in
// the browser using the Canvas API. It is NOT a real plant-classification
// model — it's a best-effort pre-filter so obviously invalid images
// (screenshots, documents, very dark/blurry photos, random non-plant
// photos) don't reach the disease classifier during development.
//
// IMPORTANT: if disease detection is ever backed by a real server, that
// server should independently validate the image too. Never rely on this
// frontend check alone as the only line of defense.

const VALIDATION_ENDPOINT = import.meta.env.VITE_PLANT_VALIDATION_API_URL || null;

// Image must score at least this high (0-1) to be treated as a plant/leaf.
// Tune this once a real model is connected.
const CONFIDENCE_THRESHOLD = 0.5;

export async function validatePlantImage(imageFile) {
  if (!imageFile) {
    return { isPlantLeaf: false, confidence: 0, reason: 'no_image' };
  }

  if (VALIDATION_ENDPOINT) {
    return validateWithBackend(imageFile);
  }

  return validateWithHeuristic(imageFile);
}

async function validateWithBackend(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(VALIDATION_ENDPOINT, { method: 'POST', body: formData });
  if (!response.ok) {
    throw new Error(`Plant validation request failed with status ${response.status}`);
  }
  const data = await response.json();

  const confidence = data.confidence ?? data.plant_confidence ?? 0;
  const backendSaysPlant = data.isPlant ?? data.is_plant ?? null;
  const isPlantLeaf =
    backendSaysPlant === null ? confidence >= CONFIDENCE_THRESHOLD : Boolean(backendSaysPlant);

  return {
    isPlantLeaf,
    confidence,
    reason: isPlantLeaf ? null : data.reason ?? 'no_plant_detected',
  };
}

// ---- Client-side heuristic fallback (used only when no real endpoint is configured) ----

async function validateWithHeuristic(imageFile) {
  try {
    const { avgBrightness, sharpness, greenRatio, nearWhiteRatio, avgSaturation } =
      await analyzeImage(imageFile);

    if (avgBrightness < 25) {
      return { isPlantLeaf: false, confidence: 0.1, reason: 'too_dark' };
    }

    if (sharpness < 8) {
      return { isPlantLeaf: false, confidence: 0.2, reason: 'too_blurry' };
    }

    // Screenshots/documents: mostly near-white background, low color
    // saturation, hardly any plant-green pixels.
    if (nearWhiteRatio > 0.55 && avgSaturation < 0.15) {
      return { isPlantLeaf: false, confidence: 0.15, reason: 'looks_like_document' };
    }

    // Weighted plant-likelihood score. Green-pixel ratio is the strongest
    // signal available without a real model; sharpness and saturation
    // contribute a smaller amount.
    const confidence = Math.min(
      1,
      greenRatio * 0.8 + Math.min(avgSaturation, 0.4) * 0.3 + Math.min(sharpness / 40, 1) * 0.1
    );

    return {
      isPlantLeaf: confidence >= CONFIDENCE_THRESHOLD,
      confidence: Number(confidence.toFixed(2)),
      reason: confidence >= CONFIDENCE_THRESHOLD ? null : 'no_plant_detected',
    };
  } catch {
    // If image analysis itself fails (corrupt file, unsupported format,
    // canvas/security error) don't silently let it through — treat as
    // invalid rather than risk a diagnosis on unreadable input.
    return { isPlantLeaf: false, confidence: 0, reason: 'image_unreadable' };
  }
}

function analyzeImage(imageFile) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(imageFile);
    const img = new Image();

    img.onload = () => {
      try {
        const SIZE = 100; // downscaled — heuristic doesn't need full resolution
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        let brightnessSum = 0;
        let greenPixels = 0;
        let nearWhitePixels = 0;
        let saturationSum = 0;
        const gray = new Float32Array(SIZE * SIZE);

        for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const brightness = (r + g + b) / 3;
          brightnessSum += brightness;
          gray[p] = brightness;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          saturationSum += saturation;

          // Plant-green heuristic: green channel meaningfully dominant
          // over red and blue, and not near-black.
          if (g > r + 12 && g > b + 12 && g > 40) {
            greenPixels += 1;
          }

          if (r > 235 && g > 235 && b > 235) {
            nearWhitePixels += 1;
          }
        }

        const totalPixels = SIZE * SIZE;
        const avgBrightness = brightnessSum / totalPixels;
        const avgSaturation = saturationSum / totalPixels;
        const greenRatio = greenPixels / totalPixels;
        const nearWhiteRatio = nearWhitePixels / totalPixels;

        // Simple Laplacian-style edge/sharpness estimate on the grayscale
        // buffer (skips the 1px border). Low values indicate a blurry image.
        let edgeEnergy = 0;
        for (let y = 1; y < SIZE - 1; y += 1) {
          for (let x = 1; x < SIZE - 1; x += 1) {
            const idx = y * SIZE + x;
            const laplacian =
              4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - SIZE] - gray[idx + SIZE];
            edgeEnergy += Math.abs(laplacian);
          }
        }
        const sharpness = edgeEnergy / totalPixels;

        URL.revokeObjectURL(url);
        resolve({ avgBrightness, sharpness, greenRatio, nearWhiteRatio, avgSaturation });
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image for validation'));
    };

    img.src = url;
  });
}
