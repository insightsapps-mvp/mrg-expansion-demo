import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Info, Send, RotateCcw } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { fmtAgo, fmtBRL, fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge, Empty, FixedBottomBar, PageHeader, PreviewBanner } from '@/components/ui';
import type { MonthlyReport } from '@/types';
import { daysToNextDue } from './_components/fdo';

type Field = 'grossSales' | 'tickets' | 'cogs' | 'staff';
const FIELDS: Field[] = ['grossSales', 'tickets', 'cogs', 'staff'];
const empty: Record<Field, string> = { grossSales: '', tickets: '', cogs: '', staff: '' };

const toNum = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(/\./g, '').replace(',', '.')));

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function FranchiseeMonthlyReport() {
  const { t, lang } = useT();
  const reports = useApp((s) => s.reports);
  const [vals, setVals] = useState<Record<Field, string>>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState<MonthlyReport | null>(null);

  const due = useMemo(daysToNextDue, []);
  const period = currentMonth();

  const n = {
    grossSales: toNum(vals.grossSales),
    tickets: toNum(vals.tickets),
    cogs: toNum(vals.cogs),
    staff: toNum(vals.staff),
  };
  const avg = n.grossSales > 0 && n.tickets > 0 ? n.grossSales / n.tickets : null;
  const cogsPct = n.grossSales > 0 && n.cogs > 0 ? (n.cogs / n.grossSales) * 100 : null;

  const errors = useMemo(() => {
    const e: Partial<Record<Field, string>> = {};
    FIELDS.forEach((f) => {
      const v = toNum(vals[f]);
      if (vals[f].trim() === '') e[f] = 'fdo.rep.errRequired';
      else if (!Number.isFinite(v) || v <= 0) e[f] = 'fdo.rep.errPositive';
    });
    return e;
  }, [vals]);

  const setField = (f: Field, v: string) => setVals((p) => ({ ...p, [f]: v.replace(/[^\d.,]/g, '') }));

  const monthLabel = (m: string) => (m === 'prev' ? t('fdo.rep.monthPrev') : fmtDate(`${m}-01T12:00:00`, 'MMMM yyyy', lang));

  const submit = () => {
    setSubmitted(true);
    const s = useApp.getState();
    if (Object.keys(errors).length > 0) {
      s.toast(tr('fdo.rep.fixErrors', s.lang), 'warn');
      return;
    }
    const r: MonthlyReport = {
      month: period,
      grossSales: n.grossSales,
      tickets: Math.round(n.tickets),
      avgTicket: Math.round((n.grossSales / n.tickets) * 10) / 10,
      cogs: n.cogs,
      staff: Math.round(n.staff),
      sentDaysAgo: 0,
    };
    s.addReport(r);
    s.toast(tr('fdo.rep.sentToast', s.lang), 'ok');
    setSent(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setSent(null);
    setVals(empty);
    setSubmitted(false);
  };

  const fieldCls = (f: Field) => cn('input font-mono', submitted && errors[f] && 'border-danger focus:border-danger focus:ring-danger/25');
  const err = (f: Field) =>
    submitted && errors[f] ? (
      <p id={`fdo-err-${f}`} className="mt-1 text-xs font-medium text-danger">
        {t(errors[f] as string)}
      </p>
    ) : null;

  return (
    <div>
      <PageHeader
        kicker={t('kicker.franquiciado')}
        title={t('fdo.rep.title')}
        subtitle={t('fdo.rep.subtitle')}
        actions={
          <Badge tone="warn" className="min-h-[32px] px-3 text-xs">
            <CalendarClock size={13} />
            {t('fdo.rep.due')}
          </Badge>
        }
      />
      <PreviewBanner bullets={[t('fdo.rep.b1'), t('fdo.rep.b2'), t('fdo.rep.b3')]} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="card flex flex-1 items-center gap-3 p-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warn/10 text-warn">
            <CalendarClock size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink">
              {due.days === 0 ? t('fdo.rep.dueToday') : t('fdo.rep.dueIn', { n: due.days })}
            </div>
            <div className="text-xs text-muted">{t('fdo.rep.nextDue', { date: fmtDate(due.due, lang === 'es' ? "d 'de' MMMM" : 'MMMM d', lang) })}</div>
          </div>
        </div>
        <div className="flex flex-1 items-start gap-3 rounded-card border border-accent/20 bg-accent-soft p-4 text-[13px] text-ink">
          <Info size={17} className="mt-0.5 shrink-0 text-accent" />
          <span>{t('fdo.rep.note')}</span>
        </div>
      </div>

      {sent ? (
        <div className="card fade-up p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ok/10 text-ok">
              <CheckCircle2 size={22} />
            </span>
            <div className="min-w-0">
              <div className="section-title">{t('fdo.rep.confirmTitle')}</div>
              <div className="mt-0.5 text-sm text-ink2">{t('fdo.rep.confirmDesc', { month: monthLabel(sent.month) })}</div>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {[
              { k: 'fdo.rep.grossSales', v: fmtBRL(sent.grossSales) },
              { k: 'fdo.rep.tickets', v: sent.tickets.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US') },
              { k: 'fdo.rep.avgTicket', v: `R$ ${sent.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { k: 'fdo.rep.cogsShort', v: `${fmtBRL(sent.cogs)} · ${((sent.cogs / sent.grossSales) * 100).toFixed(1)}%` },
              { k: 'fdo.rep.staff', v: String(sent.staff) },
            ].map((x) => (
              <div key={x.k} className="rounded-ctl bg-subtle px-3 py-2.5">
                <dt className="kpi-label">{t(x.k)}</dt>
                <dd className="num mt-1 truncate text-[15px] text-ink">{x.v}</dd>
              </div>
            ))}
          </dl>
          <button className="btn-secondary mt-5 hidden lg:inline-flex" onClick={reset}>
            <RotateCcw size={15} />
            {t('fdo.rep.newReport')}
          </button>
        </div>
      ) : (
        <form
          className="card p-5 sm:p-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="section-title text-base">{t('fdo.rep.formTitle')}</div>
            <span className="pill bg-subtle text-ink2">{t('fdo.rep.period', { month: monthLabel(period) })}</span>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-2">
            <div>
              <label className="label" htmlFor="fdo-grossSales">{t('fdo.rep.grossSales')}</label>
              <input id="fdo-grossSales" inputMode="numeric" className={fieldCls('grossSales')} placeholder="0" value={vals.grossSales} onChange={(e) => setField('grossSales', e.target.value)} aria-invalid={submitted && !!errors.grossSales} />
              {err('grossSales')}
            </div>
            <div>
              <label className="label" htmlFor="fdo-tickets">{t('fdo.rep.tickets')}</label>
              <input id="fdo-tickets" inputMode="numeric" className={fieldCls('tickets')} placeholder="0" value={vals.tickets} onChange={(e) => setField('tickets', e.target.value)} aria-invalid={submitted && !!errors.tickets} />
              {err('tickets')}
            </div>
            <div>
              <label className="label" htmlFor="fdo-avg">{t('fdo.rep.avgTicket')}</label>
              <input
                id="fdo-avg"
                readOnly
                tabIndex={-1}
                className="input cursor-default bg-subtle font-mono text-ink2"
                value={avg !== null ? `R$ ${avg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              />
              <p className="mt-1 text-xs text-muted">{t('fdo.rep.auto')}</p>
            </div>
            <div>
              <label className="label" htmlFor="fdo-cogs">{t('fdo.rep.cogs')}</label>
              <div className="relative">
                <input id="fdo-cogs" inputMode="numeric" className={cn(fieldCls('cogs'), 'pr-28')} placeholder="0" value={vals.cogs} onChange={(e) => setField('cogs', e.target.value)} aria-invalid={submitted && !!errors.cogs} />
                <span className="pointer-events-none absolute inset-y-0 right-3 my-auto flex h-fit items-center">
                  <span className={cn('pill', cogsPct === null ? 'bg-subtle text-muted' : cogsPct > 38 ? 'bg-warn/10 text-warn' : 'bg-ok/10 text-ok')}>
                    {cogsPct === null ? '— %' : t('fdo.rep.cogsPct', { pct: cogsPct.toFixed(1) })}
                  </span>
                </span>
              </div>
              {err('cogs')}
            </div>
            <div>
              <label className="label" htmlFor="fdo-staff">{t('fdo.rep.staff')}</label>
              <input id="fdo-staff" inputMode="numeric" className={fieldCls('staff')} placeholder="0" value={vals.staff} onChange={(e) => setField('staff', e.target.value)} aria-invalid={submitted && !!errors.staff} />
              {err('staff')}
            </div>
          </div>
          <div className="mt-6 hidden items-center justify-end gap-2 border-t border-line pt-4 lg:flex">
            <button type="button" className="btn-ghost" onClick={reset}>
              {t('fdo.rep.clear')}
            </button>
            <button type="submit" className="btn-primary">
              <Send size={15} />
              {t('common.send')}
            </button>
          </div>
        </form>
      )}

      {/* Historial */}
      <div className="mt-8">
        <div className="section-title mb-3">{t('fdo.rep.history')}</div>
        {reports.length === 0 ? (
          <Empty text={t('fdo.rep.historyEmpty')} />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-subtle text-left">
                  <tr className="kpi-label">
                    <th className="px-4 py-3 font-semibold">{t('fdo.rep.colMonth')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('fdo.rep.colSales')}</th>
                    <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">{t('fdo.rep.colTickets')}</th>
                    <th className="hidden px-4 py-3 text-right font-semibold md:table-cell">{t('fdo.rep.colAvg')}</th>
                    <th className="hidden px-4 py-3 text-right font-semibold md:table-cell">{t('fdo.rep.colCogs')}</th>
                    <th className="hidden px-4 py-3 text-right font-semibold lg:table-cell">{t('fdo.rep.colStaff')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('fdo.rep.colSent')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={`${r.month}-${i}`} className="border-t border-line">
                      <td className="px-4 py-3 font-medium capitalize text-ink">{monthLabel(r.month)}</td>
                      <td className="num px-4 py-3 text-right text-ink">{fmtBRL(r.grossSales)}</td>
                      <td className="num hidden px-4 py-3 text-right text-ink2 sm:table-cell">{r.tickets.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US')}</td>
                      <td className="num hidden px-4 py-3 text-right text-ink2 md:table-cell">R$ {r.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="num hidden px-4 py-3 text-right text-ink2 md:table-cell">{((r.cogs / r.grossSales) * 100).toFixed(1)}%</td>
                      <td className="num hidden px-4 py-3 text-right text-ink2 lg:table-cell">{r.staff}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-muted">{fmtAgo(r.sentDaysAgo ?? 0, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <FixedBottomBar>
        {sent ? (
          <button className="btn-secondary flex-1" onClick={reset}>
            <RotateCcw size={15} />
            {t('fdo.rep.newReport')}
          </button>
        ) : (
          <button className="btn-primary flex-1" onClick={submit}>
            <Send size={15} />
            {t('common.send')}
          </button>
        )}
      </FixedBottomBar>
    </div>
  );
}
