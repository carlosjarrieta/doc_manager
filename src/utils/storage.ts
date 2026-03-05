export async function uploadToSpaces(file: File, documentId: string): Promise<string> {
  const bucketName = import.meta.env.VITE_DO_BUCKET || "cadeveloper";
  const fileExtension = file.name.split('.').pop();
  const fileName = `ecc-docs/${documentId}.${fileExtension}`;
  
  const endpoint = import.meta.env.VITE_DO_ENDPOINT || "nyc3.digitaloceanspaces.com";
  const cleanEndpoint = endpoint.replace('https://', '').replace('http://', '').replace(/\/$/, '');
  const uploadUrl = `https://${bucketName}.${cleanEndpoint}/${fileName}`;

  try {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    
    // Fallback exactly to working configuration string parameters 
    const s3Client = new S3Client({
      endpoint: `https://${cleanEndpoint}`,
      region: "us-east-1", 
      forcePathStyle: false,
      credentials: {
        accessKeyId: import.meta.env.VITE_DO_ACCESS_KEY || "",
        secretAccessKey: import.meta.env.VITE_DO_SECRET || "",
      },
    });


    
    // Extremely important: Sanitize the content type string to ensure no weird characters break the Header constructor
    let safeContentType = file.type;
    if (!safeContentType || safeContentType.trim() === '') {
      safeContentType = 'application/octet-stream';
    } else {
      // Strip anything that might be illegal in a header value
      safeContentType = safeContentType.replace(/[^\w\d./\-+;= ]/g, '').trim();
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      // Pass the raw File object directly instead of doing Uint8Array(buffer).
      // AWS SDK v3 in the browser is much happier handling Blob/File objects directly 
      // than ArrayBuffers when constructing fetch requests.
      Body: file, 
      ACL: "public-read",
      ContentType: safeContentType,
    });

    await s3Client.send(command);
    return uploadUrl;

  } catch (error) {
    console.error("Error detallado de AWS SDK:", error);
    throw error;
  }
}
