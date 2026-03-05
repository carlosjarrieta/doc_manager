import { createClient } from '@vercel/kv';
import { BaptismCertificate } from './ai';

// Initialize the KV client pointing to Vercel KV
// Note: As with storage, in a real production app these DB calls
// should ONLY be done from a secure Next.js/Vercel serverless API route.
// For the purpose of this fast MVP demo deployed to Vercel, we can connect using the REST API URL.
const kv = createClient({
  url: import.meta.env.VITE_KV_REST_API_URL || '',
  token: import.meta.env.VITE_KV_REST_API_TOKEN || '',
});

export interface DocumentRecord {
  id: string;
  data: BaptismCertificate;
  pdfUrl: string;
  createdAt: string;
  status: string;
}

export async function saveDocument(documentId: string, data: BaptismCertificate, pdfUrl: string) {
  if (!import.meta.env.VITE_KV_REST_API_URL) {
    console.warn("KV_REST_API_URL missing. Falling back to localStorage for demo purposes.");
    // Fallback to local storage if KV is not configured
    const record: DocumentRecord = {
      id: documentId,
      data,
      pdfUrl,
      createdAt: new Date().toISOString(),
      status: 'VERIFICADO'
    };
    localStorage.setItem(`doc_${documentId}`, JSON.stringify(record));
    return;
  }

  const record: DocumentRecord = {
    id: documentId,
    data,
    pdfUrl,
    createdAt: new Date().toISOString(),
    status: 'VERIFICADO'
  };

  try {
    // Store in Vercel KV with 'doc_' prefix
    await kv.set(`doc_${documentId}`, record);
  } catch (error) {
    console.error("Error saving to Vercel KV:", error);
    throw new Error("Failed to save data to the database");
  }
}

export async function getDocument(documentId: string): Promise<DocumentRecord | null> {
  if (!import.meta.env.VITE_KV_REST_API_URL) {
    // Fallback
    const item = localStorage.getItem(`doc_${documentId}`);
    return item ? JSON.parse(item) : null;
  }

  try {
    const record = await kv.get<DocumentRecord>(`doc_${documentId}`);
    return record;
  } catch (error) {
    console.error("Error fetching from Vercel KV:", error);
    return null;
  }
}
