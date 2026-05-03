// Utility functions for common operations
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
  }).format(price);
};

export const calculateDiscount = (original: number, current: number): number => {
  return Math.round(((original - current) / original) * 100);
};

export const truncateText = (text: string, length: number): string => {
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

export const cn = (...classes: (string | false | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HT-${timestamp}-${random}`;
};

export const getCloudFrontUrl = (s3Key: string): string => {
  if (!s3Key) return "";
  // If it's already a full URL, return as is
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }
  const cloudFrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
  if (!cloudFrontUrl) {
    console.warn("NEXT_PUBLIC_CLOUDFRONT_URL is not set");
    return "";
  }
  return `${cloudFrontUrl}/${s3Key}`;
};
