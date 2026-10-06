import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, KanbanSquare, List, Plus, Search, SlidersHorizontal, Upload, X } from 'lucide-react';
import { PageHeader, PreviewBanner, Segmented, ScoreBadge, Avatar, Badge, MoveMenu, Sheet, Empty } from '@/components/ui';
import { useT, tr, en } from '@/i18n';
import { useApp } from '@/store';
import { STAGES } from '@/data/leads';
import { brands, brandById } from '@/data/brands';
import { userById } from '@/data/users';
import { computeScore, RISK_DAYS } from '@/config/scoring';
import { fmtBRLShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Lead, LeadStage } from '@/types';
import { isAtRisk, useDaysLabel, useIsDesktop } from './_components/crm/shared';
import { ImportCsvModal } from './_components/crm/ImportCsvModal';
import { NewLeadModal } from './_components/crm/NewLeadModal';

type ScoreFilter = 'all' | '90' | '75' | '50' | 'lt50';
type StatusFilter = 'all' | 'risk' | 'ok';
type SortKey = 'score' | 'name' | 'capital' | 'days';
type Row = { lead: Lead; score: number };

/* ---------- Contenido de la tarjeta ---------- */
function CardBody({ lead, score }: Row) {
  const daysLabel = useDaysLabel();
  const brand = brandById(lead.brandId);
  const late = lead.lastContactDays > RISK_DAYS;
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-ink">{lead.name}</div>
          <div className="truncate text-xs text-muted">{lead.city}</div>
        </div>
        <ScoreBadge score={score} />
      </div>
      <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-ink2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: brand?.color }} />
        <span className="truncate">{brand?.name}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="num text-[13px] font-semibold text-ink">{fmtBRLShort(lead.capital)}</span>
        <Avatar userId={lead.ownerId} size={22} />
      </div>
      <div className={cn('mt-2 flex min-w-0 items-center gap-1 text-[11px]', late ? 'font-medium text-danger' : 'text-muted')}>
        {late && <AlertCircle size={12} className="shrink-0" />}
        <span className="truncate">{daysLabel(lead.lastContactDays)}</span>
      </div>
    </>
  );
}

/* ---------- Kanban desktop ---------- */
function DraggableCard({ row, onOpen }: { row: Row; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: row.lead.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      onKeyDown={(ev) => ev.key === 'Enter' && onOpen()}
      data-trailer={`lead-${row.lead.id}`}
      className={cn(
        'card cursor-grab select-none p-3 text-left transition hover:border-line-strong hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <CardBody {...row} />
    </div>
  );
}

function Column({ stage, rows, onOpen }: { stage: LeadStage; rows: Row[]; onOpen: (id: string) => void }) {
  const { t, e } = useT();
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <section
      ref={setNodeRef}
      data-trailer={stage === 'calificado' ? 'col-calificado' : undefined}
      className={cn(
        'flex min-w-0 flex-col rounded-card border transition-colors',
        isOver ? 'border-accent bg-accent-soft' : 'border-line bg-subtle/60',
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
        <span className="truncate text-[13px] font-semibold text-ink">{e('stage', stage)}</span>
        <span className="num shrink-0 rounded-full border border-line bg-card px-2 text-[11px] text-ink2">{rows.length}</span>
      </header>
      <div className="flex max-h-[calc(100dvh-330px)] min-h-[220px] flex-col gap-2 overflow-y-auto p-2">
        {rows.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-2 py-6 text-center text-xs text-muted">{t('crm.emptyCol')}</div>
        ) : (
          rows.map((r) => <DraggableCard key={r.lead.id} row={r} onOpen={() => onOpen(r.lead.id)} />)
        )}
      </div>
    </section>
  );
}

/* ---------- Página ---------- */
export default function Crm() {
  const { t, e } = useT();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const leads = useApp((s) => s.leads);
  const rules = useApp((s) => s.rules);

  const [q, setQ] = useState('');
  const [fScore, setFScore] = useState<ScoreFilter>('all');
  const [fStage, setFStage] = useState<'all' | LeadStage>('all');
  const [fBrand, setFBrand] = useState('all');
  const [fStatus, setFStatus] = useState<StatusFilter>('all');
  const [fOwner, setFOwner] = useState('all');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [mobileStage, setMobileStage] = useState<LeadStage>('calificado');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'score', dir: 'desc' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const scored = useMemo<Row[]>(() => leads.map((lead) => ({ lead, score: computeScore(lead, rules) })), [leads, rules]);
  const owners = useMemo(() => Array.from(new Set(leads.map((l) => l.ownerId))), [leads]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return scored
      .filter(({ lead, score }) => {
        if (needle && !lead.name.toLowerCase().includes(needle) && !lead.city.toLowerCase().includes(needle)) return false;
        if (fScore === '90' && score < 90) return false;
        if (fScore === '75' && (score < 75 || score > 89)) return false;
        if (fScore === '50' && (score < 50 || score > 74)) return false;
        if (fScore === 'lt50' && score >= 50) return false;
        if (fStage !== 'all' && lead.stage !== fStage) return false;
        if (fBrand !== 'all' && lead.brandId !== fBrand) return false;
        if (fOwner !== 'all' && lead.ownerId !== fOwner) return false;
        if (fStatus === 'risk' && !isAtRisk(score, lead)) return false;
        if (fStatus === 'ok' && isAtRisk(score, lead)) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [scored, q, fScore, fStage, fBrand, fOwner, fStatus]);

  const byStage = useMemo(() => {
    const m = Object.fromEntries(STAGES.map((s) => [s, [] as Row[]])) as Record<LeadStage, Row[]>;
    filtered.forEach((r) => m[r.lead.stage].push(r));
    return m;
  }, [filtered]);

  const sortedList = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case 'name':
          return a.lead.name.localeCompare(b.lead.name) * dir;
        case 'capital':
          return (a.lead.capital - b.lead.capital) * dir;
        case 'days':
          return (a.lead.lastContactDays - b.lead.lastContactDays) * dir;
        default:
          return (a.score - b.score) * dir;
      }
    });
  }, [filtered, sort]);

  const activeFilters = [fScore !== 'all', fStage !== 'all', fBrand !== 'all', fStatus !== 'all', fOwner !== 'all'].filter(Boolean).length;
  const clearFilters = () => {
    setFScore('all');
    setFStage('all');
    setFBrand('all');
    setFStatus('all');
    setFOwner('all');
  };

  const open = useCallback((id: string) => navigate(`/admin/crm/${id}`), [navigate]);

  const move = useCallback((id: string, stage: LeadStage) => {
    const s = useApp.getState();
    const lead = s.leads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    s.moveLead(id, stage, 'u-daniel');
    s.toast(tr('crm.moved', s.lang, { name: lead.name, stage: en('stage', stage, s.lang) }));
  }, []);

  const onDragStart = (ev: DragStartEvent) => setActiveId(String(ev.active.id));
  const onDragEnd = (ev: DragEndEvent) => {
    setActiveId(null);
    if (ev.over) move(String(ev.active.id), ev.over.id as LeadStage);
  };
  const activeRow = activeId ? scored.find((r) => r.lead.id === activeId) : undefined;

  const toggleSort = (key: SortKey) =>
    setSort((p) => (p.key === key ? { key, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' ? 'asc' : 'desc' }));

  const SortTh = ({ k, label, className }: { k: SortKey; label: string; className?: string }) => (
    <th className={cn('px-3 py-1 font-semibold', className)}>
      <button type="button" onClick={() => toggleSort(k)} className="inline-flex min-h-[40px] items-center gap-1 uppercase tracking-wide hover:text-ink">
        {label}
        {sort.key === k ? sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-50" />}
      </button>
    </th>
  );

  const selects: { label: string; node: ReactNode }[] = [
    {
      label: t('crm.f.score'),
      node: (
        <select className="input" value={fScore} onChange={(ev) => setFScore(ev.target.value as ScoreFilter)}>
          <option value="all">{t('crm.f.all')}</option>
          <option value="90">90+</option>
          <option value="75">75–89</option>
          <option value="50">50–74</option>
          <option value="lt50">&lt;50</option>
        </select>
      ),
    },
    {
      label: t('crm.f.stage'),
      node: (
        <select className="input" value={fStage} onChange={(ev) => setFStage(ev.target.value as 'all' | LeadStage)}>
          <option value="all">{t('crm.f.allF')}</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {e('stage', s)}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: t('crm.f.brand'),
      node: (
        <select className="input" value={fBrand} onChange={(ev) => setFBrand(ev.target.value)}>
          <option value="all">{t('crm.f.allF')}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: t('crm.f.status'),
      node: (
        <select className="input" value={fStatus} onChange={(ev) => setFStatus(ev.target.value as StatusFilter)}>
          <option value="all">{t('crm.f.all')}</option>
          <option value="risk">{t('crm.status.risk')}</option>
          <option value="ok">{t('crm.status.ok')}</option>
        </select>
      ),
    },
    {
      label: t('crm.f.owner'),
      node: (
        <select className="input" value={fOwner} onChange={(ev) => setFOwner(ev.target.value)}>
          <option value="all">{t('crm.f.all')}</option>
          {owners.map((id) => (
            <option key={id} value={id}>
              {userById(id)?.name ?? id}
            </option>
          ))}
        </select>
      ),
    },
  ];

  const stageOptions = (current: LeadStage) =>
    STAGES.filter((s) => s !== current).map((s) => ({ value: s, label: e('stage', s) }));

  return (
    <div className="min-w-0">
      <PageHeader
        kicker={t('kicker.admin')}
        title={t('crm.title')}
        subtitle={t('crm.subtitle')}
        actions={
          <>
            <button className="btn-secondary" onClick={() => setImportOpen(true)}>
              <Upload size={16} />
              {t('crm.import')}
            </button>
            <button className="btn-primary" onClick={() => setNewOpen(true)}>
              <Plus size={16} />
              {t('crm.new')}
            </button>
          </>
        }
      />
      <PreviewBanner bullets={[t('crm.banner1'), t('crm.banner2'), t('crm.banner3')]} />

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 basis-[220px]">
            <Search size={16} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-muted" />
            <input className="input pl-9" value={q} onChange={(ev) => setQ(ev.target.value)} placeholder={t('crm.searchPh')} aria-label={t('crm.searchPh')} />
          </label>
          <button className="btn-secondary relative lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={16} />
            {t('crm.filters')}
            {activeFilters > 0 && <span className="num rounded-full bg-accent px-1.5 text-[11px] text-white dark:text-[#071a2e]">{activeFilters}</span>}
          </button>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'kanban', label: <><KanbanSquare size={14} />{t('crm.view.kanban')}</> },
              { value: 'list', label: <><List size={14} />{t('crm.view.list')}</> },
            ]}
          />
        </div>
        <div className="hidden items-end gap-2 lg:grid lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
          {selects.map((s) => (
            <label key={s.label} className="min-w-0">
              <span className="label">{s.label}</span>
              {s.node}
            </label>
          ))}
          <button className="btn-ghost btn-sm min-h-[44px]" disabled={activeFilters === 0} onClick={clearFilters}>
            <X size={14} />
            {t('crm.clear')}
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span className="num">{t('crm.results', { n: filtered.length })}</span>
          {view === 'kanban' && isDesktop && <span className="truncate">{t('crm.dragHint')}</span>}
        </div>
      </div>

      {/* Vistas */}
      {view === 'kanban' ? (
        isDesktop ? (
          <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-cols-[repeat(6,minmax(150px,1fr))] gap-3">
                {STAGES.map((s) => (
                  <Column key={s} stage={s} rows={byStage[s]} onOpen={open} />
                ))}
              </div>
            </div>
            <DragOverlay>
              {activeRow ? (
                <div className="card w-[200px] rotate-2 cursor-grabbing p-3 shadow-md">
                  <CardBody {...activeRow} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div>
            <Segmented
              scroll
              value={mobileStage}
              onChange={setMobileStage}
              options={STAGES.map((s) => ({ value: s, label: e('stage', s), count: byStage[s].length }))}
              className="mb-4"
            />
            {byStage[mobileStage].length === 0 ? (
              <Empty text={t('crm.emptyCol')} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {byStage[mobileStage].map((r) => (
                  <div
                    key={r.lead.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => open(r.lead.id)}
                    onKeyDown={(ev) => ev.key === 'Enter' && open(r.lead.id)}
                    data-trailer={`lead-${r.lead.id}`}
                    className="card p-4 text-left"
                  >
                    <CardBody {...r} />
                    <div className="mt-3 flex justify-end border-t border-line pt-3">
                      <MoveMenu label={t('common.moveTo')} options={stageOptions(r.lead.stage)} onSelect={(s) => move(r.lead.id, s)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : sortedList.length === 0 ? (
        <Empty text={t('common.noResults')} />
      ) : (
        <>
          {/* Tabla (≥ 640) */}
          <div className="card hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-line text-[11px] text-muted">
                <tr>
                  <SortTh k="name" label={t('crm.col.name')} />
                  <th className="hidden px-3 py-1 font-semibold uppercase tracking-wide md:table-cell">{t('crm.col.brand')}</th>
                  <th className="px-3 py-1 font-semibold uppercase tracking-wide">{t('crm.col.stage')}</th>
                  <SortTh k="score" label={t('crm.col.score')} />
                  <SortTh k="capital" label={t('crm.col.capital')} />
                  <th className="hidden px-3 py-1 font-semibold uppercase tracking-wide md:table-cell">{t('crm.col.owner')}</th>
                  <SortTh k="days" label={t('crm.col.days')} className="hidden md:table-cell" />
                </tr>
              </thead>
              <tbody>
                {sortedList.map((r) => {
                  const late = r.lead.lastContactDays > RISK_DAYS;
                  return (
                    <tr
                      key={r.lead.id}
                      onClick={() => open(r.lead.id)}
                      data-trailer={`lead-${r.lead.id}`}
                      className="cursor-pointer border-b border-line last:border-0 hover:bg-subtle"
                    >
                      <td className="max-w-[220px] px-3 py-3">
                        <div className="truncate font-medium text-ink">{r.lead.name}</div>
                        <div className="truncate text-xs text-muted">{r.lead.city}</div>
                      </td>
                      <td className="hidden px-3 py-3 text-ink2 md:table-cell">{brandById(r.lead.brandId)?.name}</td>
                      <td className="px-3 py-3">
                        <Badge>{e('stage', r.lead.stage)}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <ScoreBadge score={r.score} />
                      </td>
                      <td className="num px-3 py-3 text-ink">{fmtBRLShort(r.lead.capital)}</td>
                      <td className="hidden px-3 py-3 md:table-cell">
                        <span className="flex items-center gap-2">
                          <Avatar userId={r.lead.ownerId} size={24} />
                          <span className="truncate text-ink2">{userById(r.lead.ownerId)?.name}</span>
                        </span>
                      </td>
                      <td className={cn('num hidden px-3 py-3 md:table-cell', late ? 'font-semibold text-danger' : 'text-ink2')}>
                        {t('crm.daysShort', { n: r.lead.lastContactDays })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Tarjetas (< 640) */}
          <div className="flex flex-col gap-3 sm:hidden">
            <Segmented
              value={sort.key}
              onChange={(k) => toggleSort(k)}
              scroll
              options={[
                { value: 'score', label: t('crm.col.score') },
                { value: 'name', label: t('crm.col.name') },
                { value: 'capital', label: t('crm.col.capital') },
                { value: 'days', label: t('crm.col.days') },
              ]}
            />
            {sortedList.map((r) => (
              <button key={r.lead.id} type="button" onClick={() => open(r.lead.id)} data-trailer={`lead-${r.lead.id}`} className="card p-4 text-left">
                <CardBody {...r} />
                <div className="mt-2">
                  <Badge>{e('stage', r.lead.stage)}</Badge>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Filtros mobile */}
      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('crm.filters')}>
        <div className="flex flex-col gap-3 pt-1">
          {selects.map((s) => (
            <label key={s.label}>
              <span className="label">{s.label}</span>
              {s.node}
            </label>
          ))}
          <div className="mt-2 flex gap-2">
            <button className="btn-secondary flex-1" disabled={activeFilters === 0} onClick={clearFilters}>
              {t('crm.clear')}
            </button>
            <button className="btn-primary flex-1" onClick={() => setFiltersOpen(false)}>
              {t('crm.apply', { n: filtered.length })}
            </button>
          </div>
        </div>
      </Sheet>

      <ImportCsvModal open={importOpen} onClose={() => setImportOpen(false)} onImported={() => setMobileStage('nuevo')} />
      <NewLeadModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={() => setMobileStage('nuevo')} />
    </div>
  );
}
