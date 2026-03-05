import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, QrCode, Link as LinkIcon, Star, Eye, X, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { listDocuments, DocumentRecord } from '../utils/db';
import { useSearch } from '../App';

const Dashboard = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { searchTerm } = useSearch();

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      const docs = await listDocuments();
      setDocuments(docs);
      setLoading(false);
    };
    fetchDocs();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    if (!doc || !doc.data) return false;
    const term = searchTerm.toLowerCase();
    const nombres = doc.data.nombres || '';
    const apellidos = doc.data.apellidos || '';
    const fullName = `${nombres} ${apellidos}`.toLowerCase();
    return (
      fullName.includes(term) || 
      doc.id.toLowerCase().includes(term) || 
      doc.data.lugar_nacimiento?.toLowerCase().includes(term) || 
      doc.data.parroquia?.toLowerCase().includes(term) ||
      doc.data.diocesis?.toLowerCase().includes(term)
    );
  });

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `Justo ahora`;
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`;
    return date.toLocaleDateString();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in duration-300 relative min-h-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Panel de Control</h2>
          <p className="text-slate-500 font-medium">
            Gestiona tus documentos sacramentales digitalizados. Tienes <span className="text-[var(--color-primary)] font-bold">{documents.length}</span> registros.
          </p>
        </div>
        <Link to="/scan" className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2">
          <QrCode className="w-4 h-4" /> Nuevo Escaneo
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
        <button className="px-6 py-3 text-sm font-bold text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] whitespace-nowrap">Recientes</button>
        <button className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 border-b-2 border-transparent whitespace-nowrap">Favoritos</button>
        <button className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 border-b-2 border-transparent whitespace-nowrap">Por Parroquia</button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold animate-pulse">Cargando registros...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm px-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No se encontraron resultados</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
            {searchTerm ? `No hay documentos que coincidan con "${searchTerm}".` : "Aún no has registrado ningún documento sacramental."}
          </p>
          <Link to="/scan" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-slate-800 transition-all inline-block hover:scale-105">
            Comenzar Escaneo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc, i) => {
            if (!doc?.data) return null;
            return (
              <div key={doc.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 opacity-60"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?q=80&w=400&auto=format&fit=crop')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black text-slate-800 uppercase tracking-tighter shadow-sm border border-white/20">
                      Verificado
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[10px] font-black text-white/70 mb-1 uppercase tracking-widest pl-1">Partida de Bautismo</p>
                    <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-white/20">
                      <p className="text-sm font-black text-slate-800 leading-tight truncate">
                        {doc.data.nombres} {doc.data.apellidos}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 truncate">
                        {doc.data.parroquia}
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-300">
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{timeAgo(doc.createdAt)}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[var(--color-primary)]">{doc.id.split('-')[1]}</span>
                    </div>
                    <button className="text-slate-300 hover:text-yellow-400 transition-colors">
                      <Star className={`w-4 h-4 ${i === 0 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <a 
                      href={doc.pdfUrl || '#'} 
                      download 
                      className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-slate-600 group/btn"
                      title="Descargar Original"
                    >
                      <Download className="w-4 h-4 mb-1 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">Bajar</span>
                    </a>
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-[var(--color-primary-10)] hover:text-[var(--color-primary)] transition-colors border border-slate-100 text-slate-600 group/btn"
                      title="Ver Código QR"
                    >
                      <QrCode className="w-4 h-4 mb-1 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">QR</span>
                    </button>
                    <button 
                      onClick={() => handleCopy(doc.id, `${window.location.origin}/verify/${doc.id}`)}
                      className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-slate-600 group/btn"
                      title="Copiar Link"
                    >
                      {copiedId === doc.id ? <Check className="w-4 h-4 mb-1 text-green-500 scale-125" /> : <LinkIcon className="w-4 h-4 mb-1 group-hover/btn:scale-110 transition-transform" />}
                      <span className="text-[9px] font-black uppercase tracking-tighter">{copiedId === doc.id ? 'Listo' : 'Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 pb-2 flex justify-between items-center bg-white">
              <div className="w-10"></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Compartir Partida</h3>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 pt-4 flex flex-col items-center">
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 shadow-inner mb-8 relative">
                <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100">
                  <QRCodeSVG value={`${window.location.origin}/verify/${selectedDoc.id}`} size={180} />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-[var(--color-primary)] text-white p-3 rounded-2xl shadow-lg border-4 border-white">
                   <QrCode className="w-6 h-6" />
                </div>
              </div>
              
              <div className="text-center mb-10 w-full px-4">
                <h4 className="text-lg font-black text-slate-900 truncate leading-tight">
                  {selectedDoc.data.nombres} {selectedDoc.data.apellidos}
                </h4>
                <p className="text-sm text-slate-500 font-bold mt-1 mb-2">{selectedDoc.data.parroquia}</p>
                <p className="text-[11px] text-slate-400 font-mono tracking-widest bg-slate-50 py-1 rounded-full border border-slate-200 inline-block px-4">{selectedDoc.id}</p>
              </div>

              <div className="w-full space-y-3 pb-2">
                <button 
                  onClick={() => handleCopy('modal', `${window.location.origin}/verify/${selectedDoc.id}`)}
                  className="w-full bg-[var(--color-primary)] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all shadow-xl shadow-[var(--color-primary)]/20"
                >
                  {copiedId === 'modal' ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                  {copiedId === 'modal' ? 'Enlace Copiado' : 'Copiar Enlace'}
                </button>
                <Link 
                  to={`/verify/${selectedDoc.id}`}
                  className="w-full bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <Eye className="w-5 h-5" />
                  Ver Página Pública
                </Link>
                <button 
                   onClick={() => window.print()}
                   className="w-full text-slate-400 font-bold py-2 text-xs hover:text-slate-600 transition-colors"
                >
                  Imprimir etiqueta QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
