
'use server';

import { promises as fs } from 'fs';
import path from 'path';

export async function getAvatars(): Promise<string[]> {
  try {
    const imagesDirectory = path.join(process.cwd(), 'public/images/avatars');
    const imageFilenames = await fs.readdir(imagesDirectory);
    // Filter out non-image files if necessary, e.g., .DS_Store
    const imageFiles = imageFilenames.filter(file => /\.(png|jpg|jpeg|gif|webp)$/.test(file));
    return imageFiles.map(name => `/images/avatars/${name}`);
  } catch (error) {
    console.error('Failed to read avatars directory:', error);
    // Return an empty array or default avatars in case of an error
    return [];
  }
}
