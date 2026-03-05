import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Sparkles, Loader2, Trash2, Plus } from 'lucide-react';
import { fileToBase64Images } from '../utils/pdf';
import { extractCertificatesFromImages, BaptismCertificate } from '../utils/ai';
import { uploadToSpaces } from '../utils/storage';
import { saveDocument } from '../utils/db';

const EMPTY_CERTIFICATE: BaptismCertificate = {
  diocesis: '', parroquia: '', lugar_registro: '', libro: '', folio: '', numero: '',
  nombres: '', apellidos: '', fecha_nacimiento: '', lugar_nacimiento: '',
  padre: '', madre: '', padrinos: '', ministro: '', fecha_bautismo: ''
};

const DocumentRegister = () => {
  const [step, setStep] = useState<'upload' | 'processing' | 'edit' | 'success'>('upload');
  const [certificates, setCertificates] = useState<BaptismCertificate[]>([]);
  const [successRecords, setSuccessRecords] = useState<{ id: string, name: string }[]>([]);
  const [error, setError] = useState('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSourceFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStep('processing');
      setError('');
      
      const base64Images = await fileToBase64Images(file);
      const extracted = await extractCertificatesFromImages(base64Images);
      
      if (extracted && extracted.length > 0) {
        setCertificates(extracted);
      } else {
        setCertificates([{ ...EMPTY_CERTIFICATE }]);
      }
      setStep('edit');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing file');
      setStep('upload');
      setSourceFile(null);
    }
  };

  const handleFieldChange = (index: number, field: keyof BaptismCertificate, value: string) => {
    const newCerts = [...certificates];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setCertificates(newCerts);
  };

  const addCertificate = () => {
    setCertificates([...certificates, { ...EMPTY_CERTIFICATE }]);
  };

  const removeCertificate = (index: number) => {
    const newCerts = certificates.filter((_, i) => i !== index);
    if (newCerts.length === 0) newCerts.push({ ...EMPTY_CERTIFICATE });
    setCertificates(newCerts);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    try {
      const records: {id: string, name: string}[] = [];
      let pdfUrl = '';

      if (sourceFile) {
        // Upload the primary PDF/Image to Digital Ocean once per batch upload
        try {
          const batchId = 'BATCH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          pdfUrl = await uploadToSpaces(sourceFile, batchId);
        } catch (uploadErr) {
          console.warn("Real cloud upload failed. Using local blob URL for current session:", uploadErr);
          pdfUrl = previewUrl; // Use the actual file selected by the user
        }
      }
      
      for (const cert of certificates) {
        const mockDocumentId = 'DOC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Save JSON to Vercel KV
        await saveDocument(mockDocumentId, cert, pdfUrl);

        records.push({ id: mockDocumentId, name: `${cert.nombres} ${cert.apellidos}`.trim() || 'Documento sin nombre' });
      }

      setSuccessRecords(records);
      setStep('success');
      setSourceFile(null);
    } catch (err: any) {
       console.error("Save error:", err);
       setError(err.message || "Error al subir el archivo o guardar los datos.");
       setStep('edit');
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-4xl mx-auto pb-10 animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-800">{successRecords.length} Documentos Registrados</h2>
            <p className="text-slate-500 mt-2 font-medium">
              Se han generado los códigos únicos y códigos QR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
            {successRecords.map((record, i) => (
              <div key={record.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center gap-6">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0">
                  <QRCodeSVG value={`${window.location.origin}/verify/${record.id}`} size={100} />
                </div>
                <div className="overflow-hidden">
                  <span className="inline-block px-2 py-1 bg-[var(--color-primary-10)] text-[var(--color-primary)] text-[10px] font-black rounded uppercase tracking-wider mb-2">Partida #{i+1}</span>
                  <p className="font-bold text-slate-900 truncate mb-1">{record.name}</p>
                  <p className="text-xs text-slate-500 font-mono mb-4">ID: {record.id}</p>
                  <Link 
                    to={`/verify/${record.id}`}
                    className="text-sm font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                  >
                    Ver página <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-8 w-full flex justify-center">
            <button 
              onClick={() => { setStep('upload'); setCertificates([]); setPreviewUrl(''); }}
              className="px-6 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-bold text-sm transition-colors"
            >
              Escanear Nuevos Documentos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center animate-pulse">
        <Loader2 className="w-16 h-16 text-[var(--color-primary)] mx-auto animate-spin mb-6" />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Procesando Documento con IA...</h2>
        <p className="text-slate-500 mt-2 font-medium">Extrayendo datos de las partidas identificadas.</p>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="max-w-3xl mx-auto pb-10">
        <div className="mb-6">
          <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Escanear Documento con IA</h2>
          <p className="text-slate-500">
            Sube un PDF o Imagen. Nuestra IA extraerá automáticamente todas las partidas de bautismo presentes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <label className="p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group border-2 border-dashed border-transparent hover:border-[var(--color-primary)]/30 m-4 rounded-xl">
            <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
            <div className="w-16 h-16 bg-[var(--color-primary-10)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Haz clic para subir un archivo</h3>
            <p className="text-slate-500 font-medium text-center max-w-md">
              Aceptamos PDF o Imágenes (JPG, PNG). El Asistente IA leerá el documento y preparará los registros.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>O salto manual</span>
            </div>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setCertificates([{...EMPTY_CERTIFICATE}]); setStep('edit'); }}
              className="mt-4 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100"
            >
              Llenar Formulario Manualmente
            </button>
          </label>
        </div>
      </div>
    );
  }

  // Edit Step (Multiple forms)
  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Revisión de Registros</h2>
          <p className="text-slate-500">
            Se detectaron <span className="font-bold text-[var(--color-primary)]">{certificates.length}</span> partidas. Revisa y corrige antes de guardar.
          </p>
        </div>
        <button 
          onClick={addCertificate}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Agregar manual
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Form List */}
        <div className="flex-1 space-y-8 w-full">
          <form id="save-all-form" onSubmit={handleSaveAll} className="space-y-8">
            {certificates.map((cert, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative target-form animate-in slide-in-from-bottom-4">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[var(--color-primary-10)] text-[var(--color-primary)] flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    Partida de {cert.nombres || 'Desconocido'}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => removeCertificate(index)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Form fields remain same... */}
                  <section className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 mt-2">Diócesis</label>
                        <input required value={cert.diocesis} onChange={e => handleFieldChange(index, 'diocesis', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 mt-2">Parroquia</label>
                        <input required value={cert.parroquia} onChange={e => handleFieldChange(index, 'parroquia', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 mt-2">Lugar</label>
                        <input value={cert.lugar_registro} onChange={e => handleFieldChange(index, 'lugar_registro', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 mt-2">Libro</label>
                        <input required value={cert.libro} onChange={e => handleFieldChange(index, 'libro', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border bg-slate-50 px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 mt-2">Folio</label>
                        <input required value={cert.folio} onChange={e => handleFieldChange(index, 'folio', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border bg-slate-50 px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 mt-2">Número</label>
                        <input required value={cert.numero} onChange={e => handleFieldChange(index, 'numero', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border bg-slate-50 px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombres</label>
                        <input required value={cert.nombres} onChange={e => handleFieldChange(index, 'nombres', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Apellidos</label>
                        <input required value={cert.apellidos} onChange={e => handleFieldChange(index, 'apellidos', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha de Nacimiento</label>
                        <input required value={cert.fecha_nacimiento} onChange={e => handleFieldChange(index, 'fecha_nacimiento', e.target.value)} type="text" placeholder="YYYY-MM-DD" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lugar de Nacimiento</label>
                        <input value={cert.lugar_nacimiento} onChange={e => handleFieldChange(index, 'lugar_nacimiento', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del Padre</label>
                        <input value={cert.padre} onChange={e => handleFieldChange(index, 'padre', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre de la Madre</label>
                        <input value={cert.madre} onChange={e => handleFieldChange(index, 'madre', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombres de Padrinos</label>
                        <input value={cert.padrinos} onChange={e => handleFieldChange(index, 'padrinos', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ministro (Da Fe)</label>
                        <input required value={cert.ministro} onChange={e => handleFieldChange(index, 'ministro', e.target.value)} type="text" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha de Bautismo</label>
                        <input required value={cert.fecha_bautismo} onChange={e => handleFieldChange(index, 'fecha_bautismo', e.target.value)} type="text" placeholder="YYYY-MM-DD" className="w-full rounded-lg border-slate-200 border px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium" />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ))}
          </form>
        </div>

        {/* Real-time Document Preview */}
        <div className="w-full xl:w-[500px] xl:sticky xl:top-24 space-y-4">
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center text-white">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Vista Previa Original</span>
              <span className="bg-[var(--color-primary)] px-2 py-0.5 rounded text-[10px] font-black uppercase">Documento Fuente</span>
            </div>
            <div className="h-[650px] bg-slate-800 overflow-auto relative">
              {previewUrl ? (
                sourceFile?.type.startsWith('image/') ? (
                  <img src={previewUrl} alt="Source Preview" className="w-full h-auto block" />
                ) : (
                  <iframe 
                    src={`${previewUrl}#toolbar=0&navpanes=0`} 
                    className="w-full h-full border-none block" 
                    title="Source Preview" 
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-medium">Cargando visualización...</p>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
             <p className="text-xs text-blue-700 font-medium leading-relaxed">
               <strong>Tip:</strong> Puedes comparar los datos extraídos por la IA con el documento original a la izquierda antes de guardar el registro final.
             </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-6 flex justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xl mt-8 z-20 items-center">
        <p className="text-slate-600 font-bold px-4 text-sm hidden sm:block">
          {certificates.length} partida(s) lista(s) para emitir QR
        </p>
        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => setStep('upload')}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button 
            form="save-all-form"
            type="submit" 
            className="flex-1 sm:flex-none px-8 py-3 rounded-lg font-black text-white shadow-xl transition-all focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] text-sm bg-[var(--color-primary)] hover:opacity-90 active:scale-95"
          >
            Emitir {certificates.length} Registro(s) y QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentRegister;
