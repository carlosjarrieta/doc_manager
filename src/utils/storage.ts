import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Note: To avoid exposing credentials in the client in a production app, 
// this should ideally be done in a Serverless Function (Vercel API Route).
// For this MVP, we will use it directly on the client with the keys provided in .env,
// since Vite makes env vars available via import.meta.env for VITE_ prefixed keys.

const s3Client = new S3Client({
  endpoint: import.meta.env.VITE_DO_ENDPOINT || "https://nyc3.digitaloceanspaces.com",
  region: import.meta.env.VITE_DO_REGION || "nyc3",
  forcePathStyle: false,
  credentials: {
    accessKeyId: import.meta.env.VITE_DO_ACCESS_KEY || "",
    secretAccessKey: import.meta.env.VITE_DO_SECRET || "",
  },
});

export async function uploadToSpaces(file: File, documentId: string): Promise<string> {
  const bucketName = import.meta.env.VITE_DO_BUCKET || "cadeveloper";
  // Create a clean filename with the ID
  const fileExtension = file.name.split('.').pop();
  const fileName = `ecc-docs/${documentId}.${fileExtension}`;

  const buffer = await file.arrayBuffer();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: new Uint8Array(buffer),
    ACL: "public-read", // Make it publicly accessible for the verification page
    ContentType: file.type,
  });

  try {
    await s3Client.send(command);
    // Para Digital Ocean Spaces el formato es: https://bucket.region.digitaloceanspaces.com/key
    // O si el endpoint ya incluye el region: https://bucket.endpoint/key
    const endpoint = import.meta.env.VITE_DO_ENDPOINT || "nyc3.digitaloceanspaces.com";
    const cleanEndpoint = endpoint.replace('https://', '');
    return `https://${bucketName}.${cleanEndpoint}/${fileName}`;
  } catch (error) {
    console.error("Error real de subida a DO:", error);
    throw error;
  }
}
