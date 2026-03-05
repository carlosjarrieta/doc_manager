import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Note: To avoid exposing credentials in the client in a production app, 
// this should ideally be done in a Serverless Function (Vercel API Route).
// For this MVP, we will use it directly on the client with the keys provided in .env,
// since Vite makes env vars available via import.meta.env for VITE_ prefixed keys.

const s3Client = new S3Client({
  endpoint: import.meta.env.VITE_DO_ENDPOINT || "https://nyc3.digitaloceanspaces.com",
  region: import.meta.env.VITE_DO_REGION || "nyc3",
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

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: file,
    ACL: "public-read", // Make it publicly accessible for the verification page
    ContentType: file.type,
  });

  try {
    await s3Client.send(command);
    // Generate the public URL
    const endpoint = import.meta.env.VITE_DO_ENDPOINT || "https://nyc3.digitaloceanspaces.com";
    return `${endpoint}/${bucketName}/${fileName}`;
  } catch (error) {
    console.error("Error uploading to Digital Ocean Spaces:", error);
    throw new Error("Failed to upload document to storage.");
  }
}
