import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: 'dtifwnqmj',
  api_key: '727385529975829',
  api_secret: '7MHUbyjLyYQhGxXiEoNgt-LdtDM',
});

// Custom storage that uploads to Cloudinary
const cloudinaryStorage = multer.memoryStorage();

export const upload = multer({ 
  storage: cloudinaryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Helper function to upload buffer to Cloudinary
// If Cloudinary is not configured (e.g. in local dev), it resolves with a dummy result
// so the app can still create posts without failing.
export const uploadToCloudinary = (buffer, folder = 'sari') => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  const isConfigured =
    CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET;

  if (!isConfigured) {
    // Skip upload in dev if not configured
    return Promise.resolve({
      secure_url: '',
    });
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

export default cloudinary;
