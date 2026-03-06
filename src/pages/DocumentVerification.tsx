import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileCheck, ShieldCheck, Download, QrCode, Maximize, ZoomIn, ZoomOut, ChevronRight, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getDocument, DocumentRecord } from '../utils/db';
import { OfficialCertificate } from '../components/OfficialCertificate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const DocumentVerification = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [data, setData] = useState<any>(null);
  const [record, setRecord] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (documentId) {
        const docRecord = await getDocument(documentId);
        if (docRecord) {
          setRecord(docRecord);
          setData(docRecord.data);
          console.log("Document loaded:", docRecord.id);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [documentId]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('official-certificate');
    if (!element) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Better resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      } as any);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificado_${data?.nombres}_${data?.apellidos}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      if (record?.pdfUrl) window.open(record.pdfUrl, '_blank');
    } finally {
      setIsGenerating(false);
    }
  };

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden md:overflow-hidden font-sans">
      {/* Breadcrumbs & Header */}
      <div className="px-4 md:px-10 py-4 md:py-6 shrink-0">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-2 font-bold">
          <Link className="hover:text-[var(--color-primary)]" to="/">Registros</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900">Certificado Digital</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight break-all md:break-normal line-clamp-2 md:line-clamp-none">
              {data.nombres} {data.apellidos}
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium flex flex-wrap gap-1">
              <span>Validado el {record ? new Date(record.createdAt).toLocaleDateString() : 'Recientemente'}</span>
              <span className="hidden md:inline">•</span>
              <span className="break-all">ID: {documentId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex flex-col-reverse lg:flex-row flex-1 gap-4 md:gap-6 px-4 md:px-10 pb-6 md:pb-10 md:overflow-hidden min-h-min">
        
        {/* Left: Document View */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[500px] lg:min-h-[600px]">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-100 shrink-0 bg-white z-10">
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={handleZoomOut} className="p-2 md:p-1 bg-slate-50 md:bg-transparent hover:bg-slate-100 rounded-lg md:rounded transition-colors" title="Alejar"><ZoomOut className="w-5 h-5 text-slate-600" /></button>
              <span className="text-sm font-bold text-slate-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="p-2 md:p-1 bg-slate-50 md:bg-transparent hover:bg-slate-100 rounded-lg md:rounded transition-colors" title="Acercar"><ZoomIn className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="flex items-center gap-4 hidden sm:flex">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileCheck className="w-3.5 h-3.5" /> Diseño Oficial Generado
              </span>
            </div>
            <button onClick={handleResetZoom} className="p-2 md:p-1 bg-slate-50 md:bg-transparent hover:bg-slate-100 rounded-lg md:rounded transition-colors" title="Restablecer"><Maximize className="w-5 h-5 text-slate-600" /></button>
          </div>
          <div className="flex-1 bg-slate-50 p-2 sm:p-4 overflow-auto flex justify-center items-start">
            <div 
              className="relative transition-transform duration-200 ease-out origin-top w-full max-w-[210mm]"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <OfficialCertificate data={data} documentId={documentId || ''} />
            </div>
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 md:gap-6 shrink-0 md:overflow-y-auto pr-1">
          
          <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
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
              Verificación QR
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg flex flex-col items-center justify-center gap-4 border border-slate-100">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                   <div className="w-28 h-28 flex items-center justify-center text-slate-900">
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
              Descargar
            </h3>
            <div className="space-y-2">
              <button 
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary-10)] hover:bg-[var(--color-primary-20)] transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-[var(--color-primary)] rounded text-white">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Certificado Oficial</p>
                    <p className="text-xs text-slate-500 font-medium">{isGenerating ? 'Generando PDF...' : 'PDF Alta Resolución'}</p>
                  </div>
                </div>
                {!isGenerating && <Download className="w-5 h-5 text-[var(--color-primary)]" />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;
