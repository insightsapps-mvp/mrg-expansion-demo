import { Printer } from 'lucide-react';
import { DevNotice, Modal } from '@/components/ui';
import { useT } from '@/i18n';
import { fmtDate } from '@/lib/format';
import type { DraftSection } from '@/lib/proposalTemplate';

const PRINT_CSS = `@media print {
  body * { visibility: hidden !important; }
  .print-sheet, .print-sheet * { visibility: visible !important; }
  .print-sheet { position: absolute !important; left: 0; top: 0; width: 100% !important; box-shadow: none !important; border: 0 !important; }
}`;

export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) =>
        line.trim().startsWith('·') ? (
          <p key={i} className="pl-4 -indent-3">
            {line}
          </p>
        ) : (
          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
            {line}
          </p>
        ),
      )}
    </>
  );
}

export function PdfPreview({
  open,
  onClose,
  sections,
  leadName,
  brand,
  templateLabel,
}: {
  open: boolean;
  onClose: () => void;
  sections: DraftSection[];
  leadName: string;
  brand: string;
  templateLabel: string;
}) {
  const { t, lang } = useT();
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={860}
      title={t('gen.pdf.title')}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
          <button className="btn-primary" onClick={() => window.print()}>
            <Printer size={16} />
            {t('gen.btn.print')}
          </button>
        </>
      }
    >
      {open && <style>{PRINT_CSS}</style>}
      <DevNotice feature={t('gen.pdf.dev.feature')} now={t('gen.pdf.dev.now')} later={t('gen.pdf.dev.later')} />
      <div className="rounded-ctl bg-subtle p-2 sm:p-5">
        <article className="print-sheet doc-a4 mx-auto max-w-[720px] bg-white px-6 py-8 text-[#0b1a2b] shadow-md sm:px-12 sm:py-12">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d9dfe7] pb-5">
            <img src="/brand/logo-navy.png" alt="MRG · Mercosur Retail Group" className="h-10 w-auto" />
            <div className="text-right text-[11px] leading-relaxed text-[#5a6675]">
              <div className="font-semibold uppercase tracking-[0.14em] text-[#1769aa]">{t('gen.doc.kicker')}</div>
              <div>
                {t('gen.pdf.date')}: {fmtDate(new Date(), 'd MMM yyyy', lang)}
              </div>
              <div>
                {t('gen.pdf.template')}: {templateLabel}
              </div>
            </div>
          </header>
          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#5a6675]">{t('gen.doc.for')}</div>
            <h1 className="mt-1 text-[24px] font-bold leading-tight">{leadName}</h1>
            <div className="text-sm text-[#5a6675]">{brand} · São Paulo</div>
          </div>
          <div className="mt-6 space-y-5 text-[13px] leading-relaxed">
            {sections.map((s) => (
              <section key={s.id}>
                <h2 className="mb-1.5 text-[14px] font-bold text-[#13294b]">{s.title}</h2>
                <Paragraphs text={s.body} />
              </section>
            ))}
          </div>
          <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[#d9dfe7] pt-4 text-[10.5px] text-[#5a6675]">
            <span>Mercosur Retail Group · São Paulo · Buenos Aires</span>
            <span>
              {t('gen.pdf.prepared')}: MRG · {t('gen.pdf.confidential')}
            </span>
          </footer>
        </article>
      </div>
    </Modal>
  );
}
