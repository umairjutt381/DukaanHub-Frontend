"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { resolveAssetUrl } from "@/lib/utils";

type AssetImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
  fallbackSrc?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

export function AssetImage({
  src,
  fallbackSrc = "/brand/product-placeholder.svg",
  onError,
  ...props
}: AssetImageProps) {
  const resolvedSrc = resolveAssetUrl(src, fallbackSrc);
  const [activeSrc, setActiveSrc] = useState(resolvedSrc);

  useEffect(() => {
    setActiveSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <Image
      {...props}
      src={activeSrc}
      onError={(event) => {
        if (activeSrc !== fallbackSrc) setActiveSrc(fallbackSrc);
        onError?.(event);
      }}
    />
  );
}
