import Image, { ImageProps } from "next/image";
import React from "react";

function ImageComponent(props: ImageProps) {
  const { src, alt, args } = props;

  return <Image src={src} alt={alt} className="image-properties" {...args} />;
}

export default ImageComponent;
