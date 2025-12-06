import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Upload file buffer to Cloudinary
 * Works with memory storage (Vercel serverless compatible)
 */
export const uploadToCloudinary = (fileBuffer, folder = 'uploads', transformation = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error('No file buffer provided'));
    }

    console.log(`[uploadToCloudinary] Uploading to folder: ${folder}`);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: Object.keys(transformation).length > 0 ? [transformation] : undefined,
      },
      (error, result) => {
        if (error) {
          console.error('[uploadToCloudinary] Upload failed:', error);
          reject(error);
        } else {
          console.log('[uploadToCloudinary] Upload successful:', result.secure_url);
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

export default uploadToCloudinary;
