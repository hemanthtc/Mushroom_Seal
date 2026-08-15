import { useEffect, useState } from 'react';
import QR from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ value, size = 168, className = '' }) => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    QR.toDataURL(value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#052e16', light: '#ffffff' },
    })
      .then((d) => mounted && setUrl(d))
      .catch(() => mounted && setUrl(''));
    return () => {
      mounted = false;
    };
  }, [value, size]);

  if (!url) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`animate-pulse bg-emerald-900 rounded-xl ${className}`}
        data-testid="qr-loading"
      />
    );
  }

  return (
    <img
      src={url}
      width={size}
      height={size}
      alt="Verification QR Code"
      className={`rounded-xl shadow-lg bg-white p-1 ${className}`}
      data-testid="qr-image"
    />
  );
};
