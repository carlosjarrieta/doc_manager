import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface CertificateProps {
  data: any;
  documentId: string;
}

const DataRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="flex border-b border-dashed py-3 text-[13px] md:text-[15px]" style={{ borderColor: '#cbd5e1' }}>
    <div className="w-1/3 uppercase tracking-widest font-semibold text-[10px] md:text-xs flex items-end pb-1" style={{ color: '#64748b' }}>
      {label}
    </div>
    <div className="w-2/3 font-bold uppercase pl-4 flex items-end" style={{ color: '#0f172a' }}>
      {value}
    </div>
  </div>
);

export const OfficialCertificate: React.FC<CertificateProps> = ({ data, documentId }) => {
  const verificationUrl = `${window.location.origin}/verify/${documentId}`;

  return (
    <div 
      id="official-certificate" 
      className="mx-auto relative overflow-hidden"
      style={{
        width: '100%',
        maxWidth: '215.9mm', // Letter width
        minHeight: '279.4mm', // Letter height
        padding: '10% 8%',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        fontFamily: '"Times New Roman", Times, serif',
        boxSizing: 'border-box',
        boxShadow: '0 0 40px rgba(0,0,0,0.05)'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-12 relative" style={{ color: '#1e293b' }}>
        <div className="w-20 h-24 flex items-center justify-center grayscale opacity-80 mix-blend-multiply">
           <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1" className="w-full h-full">
            <path d="M12 2L4 6v6.5C4 17.5 12 22 12 22s8-4.5 8-9.5V6l-8-4z"/>
            <path strokeLinecap="round" d="M12 12v3m-2-3h4"/>
           </svg>
        </div>
        
        <div className="flex-1 text-center px-4 pt-2">
          <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-bold mb-2" style={{ color: '#1e293b' }}>
            DIÓCESIS DE {data.diocesis || 'MAGANGUÉ'}
          </h2>
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-wide mb-1" style={{ color: '#334155' }}>
            PARROQUIA {data.parroquia || 'NUESTRA SEÑORA DEL PERPETUO SOCORRO Y JESÚS NAZARENO'}
          </h3>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: '#64748b' }}>
            {data.lugar_bautismo || 'CASCAJAL (MAGANGUÉ), BOLÍVAR - COLOMBIA'}
          </p>
          <p className="text-[8px] font-sans tracking-widest mt-1" style={{ color: '#94a3b8' }}>NIT. 890.163.168-2</p>

          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] mt-10 mb-8 border-t pt-8 inline-block" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
            PARTIDA DE BAUTISMO
          </h1>
          
          <div className="flex justify-center gap-12 font-medium italic text-base md:text-lg mb-4" style={{ color: '#334155' }}>
            <span>Libro: <strong className="font-bold border-b border-dashed min-w-[3rem] inline-block text-center" style={{ borderColor: '#94a3b8' }}>{data.libro || '0000'}</strong></span>
            <span>Folio: <strong className="font-bold border-b border-dashed min-w-[3rem] inline-block text-center" style={{ borderColor: '#94a3b8' }}>{data.folio || '000'}</strong></span>
            <span>Número: <strong className="font-bold border-b border-dashed min-w-[3rem] inline-block text-center" style={{ borderColor: '#94a3b8' }}>{data.numero || '000'}</strong></span>
          </div>
        </div>

        <div className="absolute right-0 top-0">
          <p className="font-black text-sm tracking-wider" style={{ color: '#a41a22' }}>
            Nº {documentId ? documentId.slice(0, 4).toUpperCase() : '0000'}
          </p>
        </div>
      </div>

      {/* Structured Form Layout */}
      <div className="mt-8">
        <DataRow label="LUGAR BAUTISMO" value={data.lugar_bautismo || `PARROQUIA ${data.parroquia}`} />
        <DataRow label="APELLIDOS" value={data.apellidos} />
        <DataRow label="NOMBRES" value={data.nombres} />
        
        <div className="flex border-b border-dashed py-3 text-[13px] md:text-[15px]" style={{ borderColor: '#cbd5e1' }}>
          <div className="w-1/3 uppercase tracking-widest font-semibold text-[10px] md:text-xs flex items-end pb-1" style={{ color: '#64748b' }}>
            FECHA NACIMIENTO
          </div>
          <div className="w-1/3 font-bold uppercase pl-4 flex items-end" style={{ color: '#0f172a' }}>
            {data.fecha_nacimiento || '__________'}
          </div>
          <div className="w-1/6 uppercase tracking-widest font-semibold text-[10px] md:text-xs flex items-end pb-1 pl-4" style={{ color: '#64748b' }}>
            FECHA BAUTISMO
          </div>
          <div className="w-2/3 font-bold uppercase pl-2 flex items-end" style={{ color: '#0f172a' }}>
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
      <div className="mt-8 p-6 border rounded min-h-[120px]" style={{ backgroundColor: '#fcfcfc', borderColor: '#e2e8f0' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2 font-sans" style={{ color: '#94a3b8' }}>NOTA AL MARGEN</p>
        <p className="text-sm italic leading-relaxed" style={{ color: '#334155' }}>
          {data.nota_marginal || "Sin nota marginal en el registro histórico original."}
        </p>
      </div>

      {/* Footer Signatures & QR */}
      <div className="mt-16 flex justify-between items-end relative">
        
        {/* Signatures */}
        <div className="flex gap-16 w-full pl-8">
            <div className="text-center">
              <div className="border-b h-16 w-60 mb-2" style={{ borderColor: '#94a3b8' }}></div>
              <p className="text-[11px] uppercase tracking-widest font-bold font-sans" style={{ color: '#334155' }}>PÁRROCO O FIRMANTE</p>
            </div>
            
            {/* Seal placeholder */}
            <div className="w-24 h-24 rounded-full border border-dashed flex items-center justify-center opacity-50 relative top-4" style={{ borderColor: '#cbd5e1' }}>
              <span className="text-[8px] uppercase tracking-widest text-center px-2" style={{ color: '#94a3b8' }}>SELLO PARROQUIAL OFICIAL</span>
            </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center absolute right-0 bottom-0 text-right">
           <QRCodeSVG value={verificationUrl} size={110} level="M" />
           <p className="text-[8px] uppercase tracking-widest font-bold mt-2 font-sans" style={{ color: '#64748b' }}>
             VERIFICACIÓN DIGITAL
           </p>
           <p className="text-[6px] uppercase tracking-widest mt-0.5 font-sans truncate max-w-[110px]" style={{ color: '#94a3b8' }}>
             {documentId}
           </p>
        </div>
      </div>
      
    </div>
  );
};
