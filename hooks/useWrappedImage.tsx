import { useEffect, useState } from 'react';

export type TWrappedCard = {
  img?: string | undefined;
  fn: Function;
};

export const useWrappedImage = ({ img = undefined, fn }: TWrappedCard): undefined | string => {
  const [imgSrc, setImgSrc] = useState<undefined | string>(undefined);
  const canvas = document.createElement('canvas');

  const cw = (canvas.width = 1080);
  const ch = (canvas.height = 1080);

  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const wrapped = new Image();

  wrapped.src = img || 'undefined';

  useEffect(() => {
    wrapped.onload = () => {
      ctx.drawImage(wrapped, 0, 0);

      if(fn){
        // Canvas drawing
        fn(cw, ch)
      }

      setImgSrc(canvas.toDataURL('image/webp', 1.0));
      return imgSrc;
    };
  }, [imgSrc]);

  return imgSrc;
};
