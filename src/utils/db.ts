import { createClient } from '@vercel/kv';
import { BaptismCertificate } from './ai';

// Initialize the KV client pointing to Vercel KV
// Note: As with storage, in a real production app these DB calls
// should ONLY be done from a secure Next.js/Vercel serverless API route.
// For the purpose of this fast MVP demo deployed to Vercel, we can connect using the REST API URL.
const kv = createClient({
  url: (import.meta.env.VITE_KV_REST_API_URL || '').trim(),
  token: (import.meta.env.VITE_KV_REST_API_TOKEN || '').trim(),
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

export async function listDocuments(): Promise<DocumentRecord[]> {
  try {
    if (!import.meta.env.VITE_KV_REST_API_URL) {
      // Fallback
      const records: DocumentRecord[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('doc_')) {
          const item = localStorage.getItem(key);
          if (item) records.push(JSON.parse(item));
        }
      }
      return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const keys = await kv.keys('doc_*');
    if (!keys || keys.length === 0) return [];
    
    const records = await kv.mget<DocumentRecord[]>(...keys);
    return records
      .filter(Boolean)
      .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()) as DocumentRecord[];
  } catch (error) {
    console.error("Error listing documents:", error);
    return [];
  }
}
export async function deleteDocument(documentId: string) {
  if (!import.meta.env.VITE_KV_REST_API_URL) {
    localStorage.removeItem(`doc_${documentId}`);
    return;
  }

  try {
    await kv.del(`doc_${documentId}`);
  } catch (error) {
    console.error("Error deleting from Vercel KV:", error);
    throw new Error("Failed to delete the document");
  }
}
