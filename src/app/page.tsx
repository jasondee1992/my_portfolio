import fs from "fs";
import path from "path";
import DesktopHome from "@/components/redesign/DesktopHome";
import { aboutParagraphs } from "@/data/aboutContent";
import { getPublicProjects } from "@/lib/projects/projectStorage";

type Album = {
  slug: string;
  name: string;
  cover: string | null;
  images: Array<{
    src: string;
    alt: string;
  }>;
};

function getAlbums(): Album[] {
  const galleryDir = path.join(process.cwd(), "public/images/gallery");

  if (!fs.existsSync(galleryDir)) {
    return [];
  }

  const folders = fs
    .readdirSync(galleryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return folders.map((folder) => {
    const folderPath = path.join(galleryDir, folder);
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort((left, right) => left.localeCompare(right));

    return {
      slug: folder,
      name: folder.replace(/[-_]/g, " "),
      cover: files.length > 0 ? `/images/gallery/${folder}/${files[0]}` : null,
      images: files.map((file) => ({
        src: `/images/gallery/${folder}/${file}`,
        alt: file,
      })),
    };
  });
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, albums] = await Promise.all([getPublicProjects(), Promise.resolve(getAlbums())]);

  return <DesktopHome aboutParagraphs={aboutParagraphs} projects={projects} albums={albums} />;
}
