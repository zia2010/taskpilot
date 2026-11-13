import { useState, memo } from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';
import { PRISMA_SCHEMA_BLUEPRINT } from '../../../constants';

export const PrismaSchemaBlueprint = memo(function PrismaSchemaBlueprint() {
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(PRISMA_SCHEMA_BLUEPRINT);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = PRISMA_SCHEMA_BLUEPRINT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  return (
    <section className="rounded-xl border border-[#222222] bg-[#141414] p-4 sm:p-5 space-y-4 min-w-0 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#222222]/80">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-[#FF4D12] shrink-0" />
            <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
              Prisma Schema (Vercel + Postgres Blueprint)
            </h2>
          </div>
          <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">
            Copyable database schema with priority enums, workflow states, and indexes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySchema}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3.5 py-2 text-xs font-mono-tech text-white hover:border-[#FF4D12] cursor-pointer shrink-0 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          {copiedSchema ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#FF4D12]" />
              <span className="text-[#FF4D12]">Copied Schema</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#A0A0A0]" />
              <span>Copy Prisma Schema</span>
            </>
          )}
        </button>
      </div>

      <div className="rounded-lg border border-[#222222] bg-[#101010] overflow-hidden min-w-0 w-full">
        {/* Terminal / Code Window Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#222222] bg-[#171717] text-[11px] font-mono-tech text-[#888888]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80" />
            <span className="ml-2 text-[#CCCCCC] font-medium">schema.prisma</span>
          </div>
          <span className="hidden sm:inline text-[#666666]">PostgreSQL • Prisma ORM</span>
        </div>

        <pre className="p-4 text-xs font-mono-tech text-[#FFA489] overflow-x-auto leading-relaxed max-w-full">
          {PRISMA_SCHEMA_BLUEPRINT}
        </pre>
      </div>
    </section>
  );
});
