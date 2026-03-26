import fs from "fs";
import path from "path";
import Navbar from "@/components/redesign/Navbar";
import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryFooter from "@/components/gallery/GalleryFooter";
import AlbumGalleryClient from "@/components/gallery/AlbumGalleryClient";

function getAlbums() {
  const galleryDir = path.join(process.cwd(), "public/images/gallery");

  if (!fs.existsSync(galleryDir)) return [];

  const folders = fs
    .readdirSync(galleryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return folders.map((folder) => {
    const folderPath = path.join(galleryDir, folder);

    const files = fs
      .readdirSync(folderPath)
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort((a, b) => a.localeCompare(b));

    return {
      slug: folder,
      name: folder.replace(/[-_]/g, " "),
      cover: files.length ? `/images/gallery/${folder}/${files[0]}` : null,
      images: files.map((file) => ({
        src: `/images/gallery/${folder}/${file}`,
        alt: file,
      })),
    };
  });
}

export default function GalleryPage() {
  const albums = getAlbums();

  return (
    <main className="min-h-screen">
      <Navbar />
      <GalleryHero />
      <AlbumGalleryClient albums={albums} />
      <GalleryFooter />
    </main>
  );
}
