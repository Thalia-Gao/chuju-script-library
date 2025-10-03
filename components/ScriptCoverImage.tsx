'use client';

import { useState } from 'react';

interface ScriptCoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ScriptCoverImage({ src, alt, className = "w-full h-auto object-cover" }: ScriptCoverImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
  };

  if (imageError) {
    return null; // 如果图片加载失败，不显示任何内容
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
