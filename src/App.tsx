import { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import DocumentRegister from './pages/DocumentRegister';
import DocumentVerification from './pages/DocumentVerification';
import Dashboard from './pages/Dashboard';
import { UploadCloud, Search, Bell, BookOpen, Layers, Share2, ScanLine, Trash2 } from 'lucide-react';

export const SearchContext = createContext<{searchTerm: string, setSearchTerm: (v: string) => void}>({
  searchTerm: '', setSearchTerm: () => {}
});

export const useSearch = () => useContext(SearchContext);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="flex h-screen overflow-hidden font-display">
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col z-10 shrink-0">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-[var(--color-primary)] rounded-lg p-2 text-white flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black leading-none text-slate-800 tracking-tight">DocManager</h1>
              <p className="text-xs text-slate-500 font-medium">Sacramental Cloud</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-[var(--color-primary-10)] text-[var(--color-primary)] font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Layers className="w-5 h-5" />
              <span className="text-sm font-semibold">Dashboard</span>
            </Link>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-semibold">Mis Documentos</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-semibold">Compartidos</span>
            </a>
            <Link to="/scan" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-4 ${location.pathname === '/scan' ? 'bg-[var(--color-primary-10)] text-[var(--color-primary)] font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
              <ScanLine className="w-5 h-5" />
              <span className="text-sm font-bold">Escanear Documento</span>
            </Link>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
              <Trash2 className="w-5 h-5" />
              <span className="text-sm font-semibold">Papelera</span>
            </a>
          </nav>
          
          <div className="p-4 mt-auto">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Storage</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-[var(--color-primary)] h-1.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
              <p className="text-xs font-semibold text-slate-600">1.5 GB of 10 GB used</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
          <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0 relative z-10 shadow-sm">
            <div className="flex-1 max-w-xl">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none outline-none rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/20 text-sm font-semibold text-slate-700 placeholder:text-slate-400 transition-all" 
                  placeholder="Buscar documentos, nombres, lugares..." 
                  type="text" 
                />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-8">
              <Link to="/scan" className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-sm">
                <ScanLine className="w-4 h-4" /> Escanear Nuevo
              </Link>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <button className="p-2 text-slate-500 hover:bg-slate-100 transition-colors rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-200 bg-cover bg-center shadow-sm cursor-pointer hover:border-[var(--color-primary)] transition-colors" style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=11')" }}></div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto w-full relative z-0 p-8">
             {children}
          </div>
        </main>
      </div>
    </SearchContext.Provider>
  );
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-display bg-slate-50">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-10 py-4 shadow-sm relative z-10">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-[var(--color-primary)] hover:opacity-80">
              <UploadCloud className="w-7 h-7 font-bold" />
              <h2 className="text-slate-900 text-xl font-black leading-tight tracking-tight">CloudDoc</h2>
            </Link>
            
            <div className="hidden md:flex relative group min-w-40 max-w-64 h-10">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100">
                <div className="text-slate-400 flex items-center justify-center pl-3 pr-2">
                  <Search className="w-4 h-4" />
                </div>
                <input className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-slate-500 px-2 pl-0 text-sm font-semibold outline-none text-slate-700" placeholder="Buscar códigos ID..." />
              </div>
            </div>
          </div>
          
          <div className="flex flex-1 justify-end gap-8 items-center">
            <nav className="flex items-center gap-8">
              <Link className="text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors" to="/">Dashboard</Link>
              <Link className="text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] py-1 text-sm font-bold" to="#">Verificación</Link>
            </nav>
            <div className="w-9 h-9 rounded-full border border-slate-200 bg-cover bg-center shadow-sm cursor-pointer ml-4" style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=11')" }}></div>
          </div>
        </header>
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isPublicPage = location.pathname.startsWith('/verify');

  return isPublicPage ? (
    <PublicLayout>
      <Routes>
        <Route path="/verify/:documentId" element={<DocumentVerification />} />
      </Routes>
    </PublicLayout>
  ) : (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scan" element={<DocumentRegister />} />
      </Routes>
    </AdminLayout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
