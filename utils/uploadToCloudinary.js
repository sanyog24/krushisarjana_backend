import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Upload file buffer to Cloudinary
 * Works with memory storage (Vercel serverless compatible)
 */
export const uploadToCloudinary = (fileBuffer, folder = 'uploads', transformation = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: Object.keys(transformation).length > 0 ? [transformation] : undefined,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
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
