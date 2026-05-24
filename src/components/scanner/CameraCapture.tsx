'use client';

import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const { videoRef, state, errorMessage, startCamera, stopCamera, captureImage } = useCamera();

  const idZoneCrop = {
    x: 46.16,
    y: 57,
    width: 47.84,
    height: 15.4,
  };

  const handleCapture = () => {
    const image = captureImage(idZoneCrop);
    if (image) {
      stopCamera();
      onCapture(image);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className="relative w-full bg-black rounded-xl overflow-hidden border border-gray-700"
        style={{ aspectRatio: '16/10' }}
      >
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {state === 'streaming' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/40" />

            <div
              className="absolute border-2 border-white rounded-lg"
              style={{ top: '8%', left: '4%', right: '4%', bottom: '22%' }}
            >
              <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-yellow-400 rounded-tl" />
              <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-yellow-400 rounded-tr" />
              <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-yellow-400 rounded-bl" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-yellow-400 rounded-br" />

              <div className="absolute -top-6 left-0 right-0 flex justify-center">
                <span className="text-yellow-300 text-xs font-medium bg-black/60 px-2 py-0.5 rounded">
                  ضع البطاقة داخل الإطار
                </span>
              </div>

              <div
                className="absolute border-2 border-red-500 rounded"
                style={{ bottom: '8%', right: '2%', width: '52%', height: '22%' }}
              >
                <div className="absolute inset-0 rounded animate-pulse bg-red-500/10" />

                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="text-red-400 text-xs bg-black/70 px-1.5 py-0.5 rounded whitespace-nowrap">
                    الرقم القومي — 14 رقم
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
              <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full">
                تأكد أن الأرقام واضحة وغير مقطوعة
              </span>
            </div>
          </div>
        )}

        {state !== 'streaming' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
            {state === 'requesting' && (
              <>
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <p className="text-white text-sm">جارٍ فتح الكاميرا...</p>
              </>
            )}
            {state === 'idle' && (
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <Camera className="w-12 h-12 text-gray-400" />
                <p className="text-gray-300 text-sm">اضغط &quot;فتح الكاميرا&quot; وضع بطاقتك داخل الإطار</p>
              </div>
            )}
            {state === 'error' && (
              <>
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-red-400 text-sm text-center px-4">{errorMessage ?? 'فشل فتح الكاميرا'}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full">
        {(state === 'idle' || state === 'error') && (
          <Button onClick={startCamera} className="flex-1 gap-2">
            <Camera className="w-4 h-4" />
            فتح الكاميرا
          </Button>
        )}
        {state === 'requesting' && (
          <Button disabled className="flex-1 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            جارٍ الطلب...
          </Button>
        )}
        {state === 'streaming' && (
          <>
            <Button onClick={handleCapture} className="flex-1 gap-2 bg-red-600 hover:bg-red-700">
              <Camera className="w-4 h-4" />
              التقاط وقراءة الرقم
            </Button>
            <Button variant="outline" onClick={stopCamera} className="gap-2">
              <X className="w-4 h-4" />
              إغلاق
            </Button>
          </>
        )}
      </div>

      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <p className="font-medium mb-1">تعذّر الوصول للكاميرا</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>تأكد أن الموقع يعمل على HTTPS</li>
            <li>اسمح للمتصفح باستخدام الكاميرا من الإعدادات</li>
            <li>أغلق التطبيقات الأخرى التي تستخدم الكاميرا</li>
            <li>حاول تحديث الصفحة</li>
          </ul>
        </div>
      )}
    </div>
  );
}
