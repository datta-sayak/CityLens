import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    // Upload base64 image directly to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'citylens-issues',
      public_id: `issue_${Date.now()}`,
    });

    return Response.json({
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}