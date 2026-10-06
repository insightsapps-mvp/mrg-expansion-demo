import { useMemo, useState } from 'react';
import { Download, DraftingCompass, Eye, FileSpreadsheet, FileText, Search, type LucideIcon } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { fmtAgo, fmtDate, daysAgoDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { documents } from '@/data/franchisee';
import { Empty, Modal, PageHeader, PreviewBanner } from '@/components/ui';
import type { DocumentItem, Lang } from '@/types';

const KIND: Record<DocumentItem['kind'], { icon: LucideIcon; cls: string }> = {
  pdf: { icon: FileText, cls: 'bg-danger/10 text-danger' },
  dwg: { icon: DraftingCompass, cls: 'bg-accent-soft text-accent' },
  xlsx: { icon: FileSpreadsheet, cls: 'bg-ok/10 text-ok' },
  docx: { icon: FileText, cls: 'bg-accent-soft text-accent' },
};

const fmtSize = (kb: number, lang: Lang) => {
  const loc = lang === 'es' ? 'es-AR' : 'en-US';
  return kb >= 1024
    ? `${(kb / 1024).toLocaleString(loc, { maximumFractionDigits: 1 })} MB`
    : `${kb.toLocaleString(loc)} KB`;
};

function KindIcon({ kind, size = 'md' }: { kind: DocumentItem['kind']; size?: 'md' | 'lg' }) {
  const k = KIND[kind];
  const Icon = k.icon;
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-ctl', k.cls, size === 'lg' ? 'h-12 w-12' : 'h-10 w-10')}>
      <Icon size={size === 'lg' ? 22 : 18} />
    </span>
  );
}

export default function FranchiseeDocuments() {
  const { t, b, lang } = useT();
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return documents;
    return documents.filter((d) => [d.name[0], d.name[1], d.owner[0], d.owner[1], d.kind].some((x) => x.toLowerCase().includes(s)));
  }, [q]);

  const doc = documents.find((d) => d.id === openId) ?? null;
  const updated = (n: number) => t('fdo.docs.updated', { ago: fmtAgo(n, lang).toLowerCase() });

  const download = () => {
    const s = useApp.getState();
    s.toast(tr('fdo.docs.downloadToast', s.lang), 'info');
  };

  return (
    <div>
      <PageHeader kicker={t('kicker.franquiciado')} title={t('fdo.docs.title')} subtitle={t('fdo.docs.subtitle')} />
      <PreviewBanner bullets={[t('fdo.docs.b1'), t('fdo.docs.b2'), t('fdo.docs.b3')]} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-muted" />
          <input
            className="input pl-9"
            placeholder={t('fdo.docs.search')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={t('fdo.docs.search')}
          />
        </label>
        <div className="text-xs text-muted">{t('fdo.docs.count', { n: list.length })}</div>
      </div>

      {list.length === 0 ? (
        <Empty text={t('fdo.docs.empty')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setOpenId(d.id)}
              className="card flex min-h-[44px] flex-col p-4 text-left transition hover:border-line-strong hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <KindIcon kind={d.kind} />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{b(d.name)}</div>
                  <div className="mt-1 truncate text-xs text-muted">{b(d.owner)}</div>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-[13px] leading-snug text-ink2">{b(d.preview)}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs text-muted">
                <span className="pill bg-subtle font-mono uppercase text-ink2">{d.kind}</span>
                <span className="num font-medium">{fmtSize(d.sizeKb, lang)}</span>
                <span className="ml-auto truncate">{updated(d.updatedDaysAgo)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!doc}
        onClose={() => setOpenId(null)}
        width={640}
        title={
          doc && (
            <span className="flex items-center gap-2">
              <Eye size={16} className="text-muted" />
              {t('fdo.docs.previewTitle')}
            </span>
          )
        }
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpenId(null)}>
              {t('common.close')}
            </button>
            <button className="btn-primary" onClick={download}>
              <Download size={16} />
              {t('common.download')}
            </button>
          </>
        }
      >
        {doc && (
          <div className="rounded-ctl bg-subtle p-3 sm:p-5">
            {/* Hoja simulada */}
            <div className="rounded-[8px] border border-line bg-card p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <KindIcon kind={doc.kind} size="lg" />
                <div className="min-w-0">
                  <div className="text-lg font-bold leading-snug text-ink">{b(doc.name)}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    <span>{b(doc.owner)}</span>
                    <span className="font-mono uppercase">{doc.kind}</span>
                    <span className="num font-medium">{fmtSize(doc.sizeKb, lang)}</span>
                    <span>{fmtDate(daysAgoDate(doc.updatedDaysAgo), 'd MMM yyyy', lang)}</span>
                  </div>
                </div>
              </div>
              <p className="mt-5 border-l-2 border-accent pl-3 text-sm leading-relaxed text-ink2">{b(doc.preview)}</p>
              <div className="mt-6 space-y-2.5" aria-hidden>
                <div className="h-3 w-2/5 rounded bg-subtle" />
                <div className="h-2.5 w-full rounded bg-subtle" />
                <div className="h-2.5 w-11/12 rounded bg-subtle" />
                <div className="h-2.5 w-4/5 rounded bg-subtle" />
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div className="h-20 rounded-[6px] bg-subtle" />
                  <div className="h-20 rounded-[6px] bg-subtle" />
                  <div className="h-20 rounded-[6px] bg-subtle" />
                </div>
                <div className="h-2.5 w-full rounded bg-subtle" />
                <div className="h-2.5 w-3/4 rounded bg-subtle" />
              </div>
              <div className="mt-6 text-right font-mono text-[10px] text-muted">{t('fdo.docs.page', { n: 1 })}</div>
            </div>
            <div className="mt-3 rounded-[8px] border border-line bg-card p-5 shadow-sm sm:p-7" aria-hidden>
              <div className="space-y-2.5">
                <div className="h-3 w-1/3 rounded bg-subtle" />
                <div className="h-2.5 w-full rounded bg-subtle" />
                <div className="h-2.5 w-5/6 rounded bg-subtle" />
                <div className="h-28 rounded-[6px] bg-subtle" />
                <div className="h-2.5 w-2/3 rounded bg-subtle" />
              </div>
              <div className="mt-6 text-right font-mono text-[10px] text-muted">{t('fdo.docs.page', { n: 2 })}</div>
            </div>
            <div className="mt-3 text-center text-xs text-muted">{t('fdo.docs.simulated')}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
