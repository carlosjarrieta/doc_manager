export async function uploadToSpaces(file: File, documentId: string): Promise<string> {
  const bucketName = import.meta.env.VITE_DO_BUCKET || "cadeveloper";
  const fileExtension = file.name.split('.').pop();
  const fileName = `ecc-docs/${documentId}.${fileExtension}`;
  
  const endpoint = import.meta.env.VITE_DO_ENDPOINT || "nyc3.digitaloceanspaces.com";
  const cleanEndpoint = endpoint.replace('https://', '').replace('http://', '').replace(/\/$/, '');
  const uploadUrl = `https://${bucketName}.${cleanEndpoint}/${fileName}`;

  try {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    
    // AWS S3 Client setup specifically for generating the signed URL
    const s3Client = new S3Client({
      endpoint: `https://${cleanEndpoint}`,
      region: "us-east-1", 
      forcePathStyle: false,
      credentials: {
        accessKeyId: import.meta.env.VITE_DO_ACCESS_KEY || "",
        secretAccessKey: import.meta.env.VITE_DO_SECRET || "",
      },
    });

    let safeContentType = file.type || 'application/octet-stream';
    safeContentType = safeContentType.replace(/[^\w\d./\-+;= ]/g, '').trim();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ACL: "public-read",
      ContentType: safeContentType,
    });

    // 1. Generate a pre-signed URL (this does not trigger the stream error as no Body is passed)
    console.log("Generando URL firmada...");
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("URL firmada generada con éxito, iniciando subida HTTP...");

    // 2. Execute a raw HTTP fetch request to upload the file directly.
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": safeContentType,
        "x-amz-acl": "public-read"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Texto de error de DO Spaces:", errorText);
      throw new Error(`Fallo en fetch (Status: ${response.status} ${response.statusText})`);
    }
    
    console.log("Subida exitosa vía fetch!");
    return uploadUrl;

  } catch (error) {
    console.error("Error detallado de AWS SDK/Fetch:", error);
    throw error;
  }
}
