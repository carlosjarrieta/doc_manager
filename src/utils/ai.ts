import OpenAI from 'openai';

// Define the interface for the structured data
export interface BaptismCertificate {
  diocesis: string;
  parroquia: string;
  lugar_registro: string;
  lugar_bautismo: string;
  libro: string;
  folio: string;
  numero: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  padre: string;
  madre: string;
  abuelos_paternos: string;
  abuelos_maternos: string;
  padrino: string;
  madrina: string;
  sacerdote: string;
  da_fe: string;
  fecha_bautismo: string;
  nota_marginal: string;
}

export async function extractCertificatesFromImages(base64Images: string[]): Promise<BaptismCertificate[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API Key is missing. Please add VITE_OPENAI_API_KEY to your .env file.");
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // For MVP demo purposes
  });

  const imageContents = base64Images.map(img => ({
    type: "image_url" as const,
    image_url: { url: img },
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert AI data extractor. You will be given images of ecclesiastical documents (like baptism certificates). 
There might be multiple certificates in a single image or across the images.
Extract ALL the baptism certificates you can find with maximum detail. 
For dates, try to format them in YYYY-MM-DD if possible, or just exact text if unclear.
Return the data adhering strictly to the JSON schema.`
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Please extract all baptism certificates from these images:" },
          ...imageContents
        ]
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "baptism_certificates_extraction",
        schema: {
          type: "object",
          properties: {
            certificates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  diocesis: { type: "string" },
                  parroquia: { type: "string" },
                  lugar_registro: { type: "string" },
                  lugar_bautismo: { type: "string" },
                  libro: { type: "string" },
                  folio: { type: "string" },
                  numero: { type: "string" },
                  nombres: { type: "string" },
                  apellidos: { type: "string" },
                  fecha_nacimiento: { type: "string" },
                  lugar_nacimiento: { type: "string" },
                  padre: { type: "string" },
                  madre: { type: "string" },
                  abuelos_paternos: { type: "string" },
                  abuelos_maternos: { type: "string" },
                  padrino: { type: "string" },
                  madrina: { type: "string" },
                  sacerdote: { type: "string" },
                  da_fe: { type: "string" },
                  fecha_bautismo: { type: "string" },
                  nota_marginal: { type: "string" }
                },
                required: [
                  "diocesis", "parroquia", "lugar_registro", "lugar_bautismo", "libro", "folio", "numero",
                  "nombres", "apellidos", "fecha_nacimiento", "lugar_nacimiento",
                  "padre", "madre", "abuelos_paternos", "abuelos_maternos", "padrino", "madrina", 
                  "sacerdote", "da_fe", "fecha_bautismo", "nota_marginal"
                ],
                additionalProperties: false
              }
            }
          },
          required: ["certificates"],
          additionalProperties: false
        },
        strict: true
      }
    }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('Failed to extract data: No content returned');
  }

  const parsed = JSON.parse(content);
  return parsed.certificates || [];
}
