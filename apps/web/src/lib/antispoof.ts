// Fase 2 (TODO): integrar modelo Silent-Face-Anti-Spoofing via onnxruntime-web.
// Hoje retorna sempre `passed: true` — toda a checagem está nas heurísticas em liveness.ts
// Pra plugar o modelo:
//  1. converter modelo .pth da MiniVision pra .onnx (script Python no README)
//  2. salvar em apps/web/public/models/anti_spoof.onnx
//  3. instalar onnxruntime-web
//  4. preencher runModel() abaixo

export interface AntispoofResult {
  passed: boolean
  score: number   // 0..1 (1 = mais real)
  reason: string
}

export async function checkAntispoofModel(_imageBlob: Blob): Promise<AntispoofResult> {
  return {
    passed: true,
    score: 1,
    reason: 'modelo de anti-spoof não integrado (Fase 2 pendente)',
  }
}
