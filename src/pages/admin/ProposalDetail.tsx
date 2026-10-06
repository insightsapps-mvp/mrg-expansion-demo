import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, ChevronRight, FileDown, GitCompare, PencilLine } from 'lucide-react';
import { useApp } from '@/store';
import { useT, tr } from '@/i18n';
import { cn } from '@/lib/utils';
import { daysAgoDate, fmtAgo, fmtDate } from '@/lib/format';
import { brandById } from '@/data/brands';
import { userById } from '@/data/users';
import { Avatar, Badge, DevNotice, PageHeader, PreviewBanner } from '@/components/ui';
import { diffChanges, statusTone, wordDiff, type DiffToken } from './_components/proposalUi';

/* ---------- Render del cuerpo: párrafos y listas ---------- */
function Line({ text }: { text: string }) {
  const m = text.match(/^([^:\d][^:]{1,38}):\s(.+)$/);
  if (m) {
    return (
      <>
        <b className="font-semibold text-[#071a2e]">{m[1]}:</b> {m[2]}
      </>
    );
  }
  return <>{text}</>;
}

function Body({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('· ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('· ')) items.push(lines[i++].slice(2));
      blocks.push(
        <ul key={`u${i}`} className="my-2 list-disc space-y-1 pl-5 marker:text-[#1769aa]">
          {items.map((it, k) => (
            <li key={k}>
              <Line text={it} />
            </li>
          ))}
        </ul>,
      );
    } else if (/^\d+\)\s/.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\)\s/.test(lines[i])) items.push(lines[i++].replace(/^\d+\)\s/, ''));
      blocks.push(
        <ol key={`o${i}`} className="my-2 list-decimal space-y-1 pl-5 marker:font-semibold marker:text-[#1769aa]">
          {items.map((it, k) => (
            <li key={k}>{it}</li>
          ))}
        </ol>,
      );
    } else {
      blocks.push(
        <p key={`p${i}`} className="my-2">
          <Line text={l} />
        </p>,
      );
      i++;
    }
  }
  return <>{blocks}</>;
}

function DiffBody({ tokens, inline }: { tokens: DiffToken[]; inline?: boolean }) {
  const Tag = inline ? 'span' : 'p';
  return (
    <Tag className={inline ? undefined : 'my-2'}>
      {tokens.map((tk, k) =>
        tk.text === '\n' ? (
          tk.kind === 'same' ? <br key={k} /> : null
        ) : (
          <span key={k}>
            <span
              className={cn(
                tk.kind === 'add' && 'rounded-[3px] bg-ok/15 px-0.5 text-[#0a6b44]',
                tk.kind === 'del' && 'rounded-[3px] bg-danger/10 px-0.5 text-[#b4322a] line-through',
              )}
            >
              {tk.text}
            </span>{' '}
          </span>
        ),
      )}
    </Tag>
  );
}

export default function ProposalDetail() {
  const { id = '' } = useParams();
  const { t, b, e, lang } = useT();
  const navigate = useNavigate();
  const proposal = useApp((s) => s.proposals.find((p) => p.id === id));
  const lead = useApp((s) => (proposal ? s.leads.find((l) => l.id === proposal.leadId) : undefined));
  const upsertProposal = useApp((s) => s.upsertProposal);

  const latest = proposal ? proposal.versions[proposal.versions.length - 1].version : 1;
  const [selected, setSelected] = useState<number>(latest);
  const [compare, setCompare] = useState(false);

  const version = proposal?.versions.find((v) => v.version === selected) ?? proposal?.versions[proposal.versions.length - 1];
  const prev = proposal && version ? proposal.versions.find((v) => v.version === version.version - 1) : undefined;

  const diffs = useMemo(() => {
    if (!compare || !version || !prev) return null;
    return version.sections.map((s, i) => {
      const old = prev.sections[i];
      return {
        title: wordDiff(old ? b(old.title) : '', b(s.title)),
        body: wordDiff(old ? b(old.body) : '', b(s.body)),
      };
    });
  }, [compare, version, prev, b]);

  if (!proposal || !version) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-subtle text-muted">
          <FileDown size={22} />
        </div>
        <p className="text-sm text-ink2">{t('props.notFound', { id })}</p>
        <Link to="/admin/propuestas" className="btn-secondary mt-5">
          <ArrowLeft size={15} />
          {t('props.backToList')}
        </Link>
      </div>
    );
  }

  const brand = brandById(proposal.brandId);
  const tplLabel = t(`props.tpl.${proposal.template}`);
  const nVersions = proposal.versions.length;
  const accepted = proposal.status === 'aceptada';
  const totalChanges = diffs ? diffs.reduce((s, d) => s + diffChanges(d.body) + diffChanges(d.title), 0) : 0;

  const exportPdf = () => {
    useApp.getState().toast(tr('props.toastPrint', lang), 'info');
    setTimeout(() => window.print(), 150);
  };
  const markAccepted = () => {
    upsertProposal({ ...proposal, status: 'aceptada', daysAgo: 0 });
    useApp.getState().toast(tr('props.toastAccepted', lang, { id: proposal.id }));
  };

  const actions = (
    <>
      <button type="button" onClick={exportPdf} className="btn-secondary">
        <FileDown size={15} />
        {t('props.export')}
      </button>
      <button type="button" onClick={() => navigate(`/admin/propuestas/nueva?lead=${proposal.leadId}`)} className="btn-secondary">
        <PencilLine size={15} />
        {t('props.edit')}
      </button>
      <button type="button" onClick={markAccepted} disabled={accepted} className="btn-primary">
        {accepted ? <CheckCircle2 size={15} /> : <Check size={15} />}
        {accepted ? t('props.accepted') : t('props.markAccepted')}
      </button>
    </>
  );

  return (
    <div>
      <div className="no-print">
        <Link to="/admin/propuestas" className="mb-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-ink2 hover:text-ink">
          <ArrowLeft size={15} />
          {t('props.back')}
        </Link>
        <PageHeader
          kicker={t('kicker.admin')}
          title={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="min-w-0 break-words">{lead?.name ?? proposal.leadId}</span>
              <Badge tone={statusTone[proposal.status]} className="text-[12px]">
                {e('proposalStatus', proposal.status)}
              </Badge>
            </span>
          }
          subtitle={
            <>
              <span className="num mr-1.5 text-muted">{proposal.id}</span>
              {t('props.detailSubtitle', {
                brand: brand?.name ?? '',
                template: tplLabel,
                versions: nVersions === 1 ? t('props.versions1') : t('props.versionsN', { n: nVersions }),
              })}
            </>
          }
          actions={actions}
        />
        <PreviewBanner bullets={[t('props.bannerA'), t('props.bannerB'), t('props.bannerC')]} />
        <DevNotice feature={t('props.pdfFeature')} now={t('props.pdfNow')} later={t('props.pdfLater')} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Hoja A4 */}
        <div className="min-w-0 lg:col-span-8">
          {compare && (
            <div className="no-print mb-3 flex flex-wrap items-center gap-2 text-xs text-ink2">
              <span className="pill bg-accent-soft text-accent">
                <GitCompare size={12} />
                {prev ? t('props.compareOn', { a: version.version, b: prev.version }) : t('props.noPrev')}
              </span>
              {prev && (
                <>
                  <span className="pill bg-ok/15 text-ok">+ {t('props.added')}</span>
                  <span className="pill bg-danger/10 text-danger line-through">{t('props.removed')}</span>
                  <span className="num text-muted">{totalChanges ? t('props.changes', { n: totalChanges }) : t('props.noChanges')}</span>
                </>
              )}
            </div>
          )}
          <article className="doc-a4 mx-auto w-full max-w-[794px] rounded-[6px] border border-line bg-white px-5 py-7 text-[13.5px] leading-relaxed text-[#2b3a4d] shadow-md sm:px-12 sm:py-12">
            <header className="flex flex-col gap-4 border-b border-[#e3e7ee] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <img src="/brand/logo-navy.png" alt="Mercosur Retail Group" className="h-10 w-auto self-start object-contain sm:h-12" />
              <div className="sm:text-right">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#1769aa]">{t('props.docTitle')}</div>
                <div className="mt-1 text-lg font-bold leading-tight text-[#071a2e]">{lead?.name ?? proposal.leadId}</div>
                <div className="mt-0.5 text-xs text-[#6b7686]">
                  {brand?.name} · {tplLabel}
                </div>
                <div className="mt-0.5 text-xs text-[#6b7686]">
                  {fmtDate(daysAgoDate(version.daysAgo), t('props.datePattern'), lang)} · <span className="font-mono">v{version.version}</span>
                </div>
              </div>
            </header>

            <div className="mt-2">
              {version.sections.map((s, i) => {
                const d = diffs?.[i];
                return (
                  <section key={i} className="mt-6 break-inside-avoid">
                    <h3 className="mb-1 text-[15px] font-bold tracking-tight text-[#071a2e]">
                      {d ? <DiffBody tokens={d.title} inline /> : b(s.title)}
                    </h3>
                    {d ? <DiffBody tokens={d.body} /> : <Body text={b(s.body)} />}
                  </section>
                );
              })}
            </div>

            <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-[#e3e7ee] pt-4 text-[11px] text-[#6b7686]">
              <span>{t('props.docFooter')}</span>
              <span className="font-mono">
                {proposal.id} · v{version.version}
              </span>
            </footer>
          </article>
        </div>

        {/* Panel lateral */}
        <aside className="no-print min-w-0 lg:col-span-4">
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="card p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="section-title text-base">{t('props.history')}</h2>
                <span className="num text-xs text-muted">{nVersions}</span>
              </div>
              <ol className="relative flex flex-col gap-1">
                {[...proposal.versions].reverse().map((v) => {
                  const active = v.version === version.version;
                  const author = userById(v.authorId);
                  return (
                    <li key={v.version}>
                      <button
                        type="button"
                        onClick={() => setSelected(v.version)}
                        aria-pressed={active}
                        className={cn(
                          'flex min-h-[44px] w-full items-start gap-3 rounded-ctl border px-3 py-2.5 text-left transition',
                          active ? 'border-accent/40 bg-accent-soft' : 'border-transparent hover:bg-subtle',
                        )}
                      >
                        <span
                          className={cn(
                            'num mt-0.5 inline-flex h-7 min-w-[32px] shrink-0 items-center justify-center rounded-full px-1.5 text-[12px]',
                            active ? 'bg-accent text-white dark:text-[#071a2e]' : 'bg-subtle text-ink2',
                          )}
                        >
                          v{v.version}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-ink">{fmtAgo(v.daysAgo, lang)}</span>
                            {v.version === latest && <Badge tone="accent">{t('props.current')}</Badge>}
                            {active && v.version !== latest && <Badge>{t('props.viewing')}</Badge>}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] leading-snug text-ink2">{b(v.summary)}</span>
                          <span className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-muted">
                            <Avatar userId={v.authorId} size={18} />
                            <span className="truncate">{t('props.by', { name: author?.name ?? '' })}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <button
                type="button"
                onClick={() => setCompare((c) => !c)}
                className={cn('mt-3 w-full', compare ? 'btn-primary' : 'btn-secondary')}
                aria-pressed={compare}
              >
                <GitCompare size={15} />
                {compare ? t('props.hideCompare') : t('props.compare')}
              </button>
              {compare && !prev && <p className="mt-2 text-xs text-muted">{t('props.noPrev')}</p>}
            </div>

            <div className="card p-4 sm:p-5">
              <h2 className="section-title mb-3 text-base">{t('props.info')}</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
                <dt className="text-muted">{t('props.lead')}</dt>
                <dd className="truncate text-right font-medium text-ink">{lead?.name ?? proposal.leadId}</dd>
                <dt className="text-muted">{t('props.colBrand')}</dt>
                <dd className="truncate text-right text-ink">{brand?.name}</dd>
                <dt className="text-muted">{t('props.colTemplate')}</dt>
                <dd className="truncate text-right text-ink">{tplLabel}</dd>
                <dt className="text-muted">{t('props.status')}</dt>
                <dd className="text-right">
                  <Badge tone={statusTone[proposal.status]}>{e('proposalStatus', proposal.status)}</Badge>
                </dd>
                <dt className="text-muted">{t('props.updated')}</dt>
                <dd className="text-right text-ink">{fmtAgo(proposal.daysAgo, lang)}</dd>
              </dl>
              {lead && (
                <Link
                  to={`/admin/crm/${lead.id}`}
                  className="mt-3 flex min-h-[44px] items-center justify-between rounded-ctl border border-line px-3 text-sm font-medium text-ink transition hover:bg-subtle"
                >
                  {t('props.openLead')}
                  <ChevronRight size={16} className="text-muted" />
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
