import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface CertificateProps {
  data: any;
  documentId: string;
}

const DataRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="flex border-b border-dashed border-slate-300 py-3 text-[13px] md:text-[15px]">
    <div className="w-1/3 text-slate-500 uppercase tracking-widest font-semibold text-[10px] md:text-xs flex items-end pb-1">
      {label}
    </div>
    <div className="w-2/3 text-slate-900 font-bold uppercase pl-4 flex items-end">
      {value}
    </div>
  </div>
);

export const OfficialCertificate: React.FC<CertificateProps> = ({ data, documentId }) => {
  const verificationUrl = `${window.location.origin}/verify/${documentId}`;

  return (
    <div 
      id="official-certificate" 
      className="bg-white mx-auto relative overflow-hidden"
      style={{
        width: '100%',
        maxWidth: '210mm',
        minHeight: '297mm', // A4 aspect ratio approx
        padding: '10% 8%',
        color: '#1e293b',
        fontFamily: '"Times New Roman", Times, serif',
        boxSizing: 'border-box',
        boxShadow: '0 0 40px rgba(0,0,0,0.05)'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-12 relative">
        <div className="w-20 h-24 flex items-center justify-center grayscale opacity-80 mix-blend-multiply">
           {/* Temporary Diocese Crest Placeholder - looks like a coat of arms in the image */}
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
            <path d="M12 2L4 6v6.5C4 17.5 12 22 12 22s8-4.5 8-9.5V6l-8-4z"/>
            <path strokeLinecap="round" d="M12 12v3m-2-3h4"/>
           </svg>
        </div>
        
        <div className="flex-1 text-center px-4 pt-2">
          <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-bold text-slate-800 mb-2">
            DIÓCESIS DE {data.diocesis || 'MAGANGUÉ'}
          </h2>
          <h3 className="text-xs md:text-sm font-bold uppercase text-slate-700 tracking-wide mb-1">
            PARROQUIA {data.parroquia || 'NUESTRA SEÑORA DEL PERPETUO SOCORRO Y JESÚS NAZARENO'}
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            {data.lugar_bautismo || 'CASCAJAL (MAGANGUÉ), BOLÍVAR - COLOMBIA'}
          </p>
          <p className="text-[8px] text-slate-400 font-sans tracking-widest mt-1">NIT. 890.163.168-2</p>

          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-slate-900 mt-10 mb-8 border-t border-slate-300 pt-8 inline-block">
            PARTIDA DE BAUTISMO
          </h1>
          
          <div className="flex justify-center gap-12 font-medium italic text-slate-700 text-base md:text-lg mb-4">
            <span>Libro: <strong className="font-bold border-b border-dashed border-slate-400 min-w-[3rem] inline-block text-center">{data.libro || '0000'}</strong></span>
            <span>Folio: <strong className="font-bold border-b border-dashed border-slate-400 min-w-[3rem] inline-block text-center">{data.folio || '000'}</strong></span>
            <span>Número: <strong className="font-bold border-b border-dashed border-slate-400 min-w-[3rem] inline-block text-center">{data.numero || '000'}</strong></span>
          </div>
        </div>

        <div className="absolute right-0 top-0">
          <p className="text-[#a41a22] font-black text-sm tracking-wider">
            Nº {documentId.slice(0, 4).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Structured Form Layout */}
      <div className="mt-8">
        <DataRow label="LUGAR BAUTISMO" value={data.lugar_bautismo || `PARROQUIA ${data.parroquia}`} />
        <DataRow label="APELLIDOS" value={data.apellidos} />
        <DataRow label="NOMBRES" value={data.nombres} />
        
        <div className="flex border-b border-dashed border-slate-300 py-3 text-[13px] md:text-[15px]">
          <div className="w-1/3 text-slate-500 uppercase tracking-widest font-semibold text-[10px] md:text-xs flex items-end pb-1">
            FECHA NACIMIENTO
          </div>
          <div className="w-1/3 text-slate-900 font-bold uppercase pl-4 flex items-end">
            {data.fecha_nacimiento || '__________'}
          </div>
          <div className="w-1/6 text-slate-500 uppercase tracking-widest font-semibold text-[10px] md:text-xs flex items-end pb-1 pl-4">
            FECHA BAUTISMO
          </div>
          <div className="w-1/6 text-slate-900 font-bold uppercase pl-2 flex items-end">
            {data.fecha_bautismo || '__________'}
          </div>
        </div>

        <DataRow label="LUGAR NACIMIENTO" value={data.lugar_nacimiento || '__________'} />
        <DataRow label="NOMBRE PADRE" value={data.padre || '__________'} />
        <DataRow label="NOMBRE MADRE" value={data.madre || '__________'} />
        <DataRow label="ABUELOS PATERNOS" value={data.abuelos_paternos || '__________'} />
        <DataRow label="ABUELOS MATERNOS" value={data.abuelos_maternos || '__________'} />
        <DataRow label="PADRINOS" value={`${data.padrino || '__________'} ${data.madrina ? `- ${data.madrina}` : ''}`} />
        <DataRow label="MINISTRO" value={data.sacerdote || '__________'} />
        <DataRow label="DA FE" value={data.da_fe || '__________'} />
      </div>

      {/* Observations Box */}
      <div className="mt-8 bg-slate-50/50 p-6 border border-slate-200 rounded min-h-[120px]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">NOTA AL MARGEN</p>
        <p className="text-sm italic text-slate-700 leading-relaxed">
          {data.nota_marginal || "Sin nota marginal en el registro histórico original."}
        </p>
      </div>

      {/* Footer Signatures & QR */}
      <div className="mt-16 flex justify-between items-end relative">
        
        {/* Signatures */}
        <div className="flex gap-16 w-full pl-8">
            <div className="text-center">
              <div className="border-b border-slate-400 h-16 w-60 mb-2"></div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-700 font-sans">PÁRROCO O FIRMANTE</p>
            </div>
            
            {/* Seal placeholder */}
            <div className="w-24 h-24 rounded-full border border-dashed border-slate-300 flex items-center justify-center opacity-50 relative top-4">
              <span className="text-[8px] uppercase tracking-widest text-slate-400 text-center px-2">SELLO PARROQUIAL OFICIAL</span>
            </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center absolute right-0 bottom-0 text-right">
           <QRCodeSVG value={verificationUrl} size={110} level="M" />
           <p className="text-[8px] uppercase tracking-widest font-bold text-slate-500 mt-2 font-sans">
             VERIFICACIÓN DIGITAL
           </p>
           <p className="text-[6px] uppercase tracking-widest text-slate-400 mt-0.5 font-sans truncate max-w-[110px]">
             {documentId}
           </p>
        </div>
      </div>
      
    </div>
  );
};
