import * as faceapi from '@vladmandic/face-api'

let loading: Promise<void> | null = null

export async function loadFaceModels(): Promise<void> {
  if (loading) return loading
  loading = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ])
  })()
  return loading
}

export { faceapi }
