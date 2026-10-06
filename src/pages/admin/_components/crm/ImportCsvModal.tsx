import { useState } from 'react';
import { FileSpreadsheet, UploadCloud, CheckCircle2 } from 'lucide-react';
import { Modal, DevNotice, ScoreBadge } from '@/components/ui';
import { useT, tr } from '@/i18n';
import { useApp } from '@/store';
import { csvImportRows } from '@/data/leads';
import { brandById } from '@/data/brands';
import { computeScore } from '@/config/scoring';
import { fmtBRLShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types';
import { nextLeadIds } from './shared';

const FILE = 'leads_feria_franquicias_sp.csv';

export function ImportCsvModal({ open, onClose, onImported }: { open: boolean; onClose: () => void; onImported?: () => void }) {
  const { t } = useT();
  const rules = useApp((s) => s.rules);
  const [loaded, setLoaded] = useState(true);
  const [over, setOver] = useState(false);
  const n = csvImportRows.length;

  const doImport = () => {
    const s = useApp.getState();
    const ids = nextLeadIds(s.leads, n);
    const leads: Lead[] = csvImportRows.map((r, i) => ({
      ...r,
      id: ids[i],
      stage: 'nuevo',
      ownerId: 'u-daniel',
      lastContactDays: 0,
      createdDaysAgo: 0,
    }));
    s.addLeads(leads);
    s.toast(tr('crm.import.done', s.lang, { n }));
    onImported?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={720}
      title={t('crm.import.title')}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn-primary" disabled={!loaded} onClick={doImport}>
            {t('crm.import.cta', { n })}
          </button>
        </>
      }
    >
      <DevNotice feature={t('crm.import.devFeature')} now={t('crm.import.devNow')} later={t('crm.import.devLater')} />

      {!loaded ? (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            setLoaded(true);
          }}
          className={cn(
            'flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-4 py-6 text-center transition',
            over ? 'border-accent bg-accent-soft' : 'border-line-strong bg-subtle hover:border-accent',
          )}
        >
          <UploadCloud size={28} className="text-accent" />
          <span className="text-sm font-semibold text-ink">{t('crm.import.drop')}</span>
          <span className="text-xs text-muted">{t('crm.import.dropHint')}</span>
        </button>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-subtle px-4 py-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl bg-ok/10 text-ok">
              <FileSpreadsheet size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-[13px] font-semibold text-ink">{FILE}</div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <CheckCircle2 size={12} className="text-ok" />
                {t('crm.import.loaded')} · {t('crm.import.rows', { n })}
              </div>
            </div>
            <button className="btn-ghost btn-sm min-h-[44px]" onClick={() => setLoaded(false)}>
              {t('crm.import.change')}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">{t('crm.import.mapped')}</p>

          <div className="mt-4 text-sm font-semibold text-ink">{t('crm.import.preview')}</div>
          <div className="mt-2 overflow-x-auto rounded-card border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-subtle text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">{t('crm.col.name')}</th>
                  <th className="hidden px-3 py-2 font-semibold sm:table-cell">{t('crm.import.city')}</th>
                  <th className="hidden px-3 py-2 font-semibold md:table-cell">{t('crm.col.brand')}</th>
                  <th className="px-3 py-2 text-right font-semibold">{t('crm.col.capital')}</th>
                  <th className="px-3 py-2 text-right font-semibold">{t('crm.col.score')}</th>
                </tr>
              </thead>
              <tbody>
                {csvImportRows.map((r) => (
                  <tr key={r.email} className="border-t border-line">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-ink">{r.name}</div>
                      <div className="text-xs text-muted sm:hidden">{r.city}</div>
                    </td>
                    <td className="hidden px-3 py-2.5 text-ink2 sm:table-cell">{r.city}</td>
                    <td className="hidden px-3 py-2.5 text-ink2 md:table-cell">{brandById(r.brandId).name}</td>
                    <td className="num px-3 py-2.5 text-right text-ink">{fmtBRLShort(r.capital)}</td>
                    <td className="px-3 py-2.5 text-right">
                      <ScoreBadge score={computeScore(r, rules)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}
