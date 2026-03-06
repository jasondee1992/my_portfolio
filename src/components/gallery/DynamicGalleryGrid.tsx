import fs from "fs";
import path from "path";
import GalleryLightboxClient from "@/components/gallery/GalleryLightboxClient";

function getGalleryImages() {
  const galleryDir = path.join(process.cwd(), "public/images/gallery");

  if (!fs.existsSync(galleryDir)) {
    return [];
  }

  const files = fs.readdirSync(galleryDir);

  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );

  return imageFiles.map((file) => ({
    src: `/images/gallery/${file}`,
    alt: file,
  }));
}

export default function DynamicGalleryGrid() {
  const images = getGalleryImages();

  return <GalleryLightboxClient images={images} />;
}