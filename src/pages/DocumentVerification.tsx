import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ShieldCheck, Download, QrCode, Maximize, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getDocument, DocumentRecord } from '../utils/db';

const DocumentVerification = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [data, setData] = useState<any>(null);
  const [record, setRecord] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (documentId) {
        const docRecord = await getDocument(documentId);
        if (docRecord) {
          setRecord(docRecord);
          setData(docRecord.data);
        } else if (documentId === 'DOC-DEMO123') {
          // Fallback mock data if accessed directly for demo and server DB has no matching ID
          setData({
            diocesis: 'Diócesis de Magangué',
            parroquia: 'Ntra Señora del Perpetuo Socorro y Jesus Nazareno',
            lugar_registro: 'Cascajal, Bolívar - Colombia',
            libro: '0005',
            folio: '0282',
            numero: '0697',
            nombres: 'Abel Jose',
            apellidos: 'Gutierrez Correa',
            fecha_nacimiento: '2011-11-13',
            lugar_nacimiento: 'Cundinamarca, Bogota, Colombia',
            fecha_bautismo: '2013-01-01',
            padre: 'Abel Antonio Gutierrez Nuñez',
            madre: 'Gloria Maria Correa T.',
            padrinos: 'Orlando Correa Turizo - Yanine Esther Correa Turizo',
            ministro: 'José Libardo Morales Acuña',
            status: 'VERIFICADO',
            createdAt: new Date().toISOString()
          });
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <ShieldCheck className="w-16 h-16 text-[var(--color-primary-10)] mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-600">Verificando Documento...</h2>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Documento No Encontrado</h1>
        <p className="text-slate-600 mt-2 font-medium">El ID {documentId} no existe en la base de datos.</p>
        <Link to="/" className="inline-block mt-6 text-[var(--color-primary)] font-bold hover:underline">
          &larr; Volver al inicio
        </Link>
      </div>
    );
  }


  const pdfDisplayUrl = record?.pdfUrl;
  const isImage = pdfDisplayUrl?.match(/\.(jpg|jpeg|png|webp|avif|gif)$|data:image/i);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Breadcrumbs & Header */}
      <div className="px-10 py-6 shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-bold">
          <Link className="hover:text-[var(--color-primary)]" to="/">Registros</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900">Verificación</span>
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Partida_Bautismo_{data.nombres.split(' ')[0]}.{isImage ? 'img' : 'pdf'}</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Validado el {record ? new Date(record.createdAt).toLocaleDateString() : 'Recientemente'} • Documento Válido • ID: {documentId}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex flex-col lg:flex-row flex-1 gap-6 px-10 pb-10 overflow-hidden">
        
        {/* Left: Document Preview */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 shrink-0 bg-white z-10">
            <div className="flex items-center gap-4 hidden sm:flex">
              <button onClick={handleZoomOut} className="p-1 hover:bg-slate-100 rounded transition-colors" title="Alejar"><ZoomOut className="w-5 h-5 text-slate-600" /></button>
              <span className="text-sm font-bold text-slate-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="p-1 hover:bg-slate-100 rounded transition-colors" title="Acercar"><ZoomIn className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="flex items-center gap-4 hidden sm:flex">
              <button className="p-1 hover:bg-slate-100 rounded transition-colors opacity-50 cursor-not-allowed"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
              <span className="text-sm font-bold text-slate-600 text-center">Pág 1 de 1</span>
              <button className="p-1 hover:bg-slate-100 rounded transition-colors opacity-50 cursor-not-allowed"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
            </div>
            <button onClick={handleResetZoom} className="p-1 hover:bg-slate-100 rounded transition-colors" title="Restablecer"><Maximize className="w-5 h-5 text-slate-600" /></button>
          </div>
          <div className="flex-1 bg-slate-100 p-4 sm:p-8 overflow-auto flex justify-center items-start scrollbar-hide">
            <div 
              className="w-full max-w-3xl bg-white shadow-lg overflow-hidden relative transition-transform duration-200 ease-out origin-top"
              style={{ transform: `scale(${zoom})`, minWidth: zoom > 1 ? `${768 * zoom}px` : 'auto' }}
            >
              {pdfDisplayUrl ? (
                isImage ? (
                  <img src={pdfDisplayUrl} alt="Soporte Bautismo" className="w-full h-auto block" />
                ) : (
                  <iframe 
                    src={`${pdfDisplayUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-[800px] border-none block"
                    title="Soporte Bautismo"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-bold">Vista previa no disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Share & Details Panel */}
        <div className="w-full lg:w-[340px] flex flex-col gap-6 shrink-0 overflow-y-auto pr-1">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <ShieldCheck className="w-32 h-32 text-green-600" />
             </div>
             
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 relative z-10">
                <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-lg font-black text-slate-800 leading-tight">Válido y Auténtico</h2>
                   <p className="text-xs text-green-600 font-bold tracking-wide">VERIFICADO DIGITALMENTE</p>
                </div>
             </div>
             
             <div className="space-y-4 text-sm font-medium text-slate-700 relative z-10">
                <div className="flex justify-between">
                   <span className="text-slate-500">Parroquia</span>
                   <span className="text-right ml-2 text-slate-900 truncate font-semibold" title={data.parroquia}>{data.parroquia}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-500">Bautizado</span>
                   <span className="text-right ml-2 text-slate-900 font-semibold">{data.nombres} {data.apellidos}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-500">Fecha Bautismo</span>
                   <span className="text-right ml-2 text-slate-900 font-semibold">{data.fecha_bautismo}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-500">Libro/Fol/No</span>
                   <span className="text-right ml-2 text-slate-900 font-semibold">{data.libro} - {data.folio} - {data.numero}</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[var(--color-primary)]" />
              Compartir Documento
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg flex flex-col items-center justify-center gap-4 border border-slate-100">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                   <div className="w-28 h-28 flex items-center justify-center">
                     <QRCodeSVG value={`${window.location.origin}/verify/${documentId}`} size={112} />
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Enlace Directo</label>
                <div className="flex items-center gap-2">
                  <input className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-[var(--color-primary)] h-10 px-3 font-medium outline-none" readOnly type="text" value={`${window.location.origin}/verify/${documentId}`} />
                  <button 
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/verify/${documentId}`)}
                    className="h-10 w-10 shrink-0 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-[var(--color-primary)]" />
              Download
            </h3>
            <div className="space-y-2">
              <a href={pdfDisplayUrl} download target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded text-red-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900">PDF Format</p>
                    <p className="text-xs text-slate-500 font-medium">Highest quality</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-slate-400 group-hover:text-[var(--color-primary)] transition-colors" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;
