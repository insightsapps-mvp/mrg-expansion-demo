import { useMemo, useState } from 'react';
import { ChevronRight, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { fmtBRL, fmtDate } from '@/lib/format';
import { DevNotice, PageHeader, PreviewBanner, Segmented } from '@/components/ui';
import type { Lang } from '@/types';
import { avgTicket, fmtInt, fmtTicket, monthDate, openUnits, sum, sumLast } from './_components/pampa';

type Period = 'mes' | 'trimestre' | 'semestre';
const MONTHS: Record<Period, number> = { mes: 1, trimestre: 3, semestre: 6 };
const SLUG: Record<Period, string> = { mes: 'mes-actual', trimestre: 'ultimo-trimestre', semestre: 'ultimos-6-meses' };
const LABEL_KEY: Record<Period, string> = { mes: 'fte.rep.pMonth', trimestre: 'fte.rep.pQuarter', semestre: 'fte.rep.pSix' };

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const dec2 = (n: number) => n.toFixed(2).replace('.', ',');

function buildCsv(period: Period, lang: Lang) {
  const n = MONTHS[period];
  const rows: (string | number)[][] = [
    [
      tr('fte.rep.csvUnit', lang),
      tr('fte.rep.csvMall', lang),
      tr('fte.rep.csvFranchisee', lang),
      tr('fte.rep.csvMonth', lang),
      tr('fte.rep.csvRevenue', lang),
      tr('fte.rep.csvTickets', lang),
      tr('fte.rep.csvAvg', lang),
    ],
  ];
  openUnits.forEach((u) => {
    for (let i = u.revenue.length - n; i < u.revenue.length; i++) {
      rows.push([
        u.name,
        u.mall,
        u.franchisee,
        fmtDate(monthDate(i, u.revenue.length), 'yyyy-MM', lang),
        u.revenue[i],
        u.tickets[i],
        dec2(avgTicket(u.revenue[i], u.tickets[i])),
      ]);
    }
  });
  const totRev = sum(openUnits.map((u) => sumLast(u.revenue, n)));
  const totTk = sum(openUnits.map((u) => sumLast(u.tickets, n)));
  rows.push([tr('fte.rep.total', lang), '', '', tr(LABEL_KEY[period], lang), totRev, totTk, dec2(avgTicket(totRev, totTk))]);
  return '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n');
}

export default function Reports() {
  const { t, lang } = useT();
  const [period, setPeriod] = useState<Period>('mes');
  const n = MONTHS[period];

  const rows = useMemo(
    () => openUnits.map((u) => ({ u, rev: sumLast(u.revenue, n), tk: sumLast(u.tickets, n) })),
    [n],
  );
  const totRev = sum(rows.map((r) => r.rev));
  const totTk = sum(rows.map((r) => r.tk));
  const range =
    n === 1
      ? fmtDate(monthDate(5), 'MMMM yyyy', lang)
      : `${fmtDate(monthDate(6 - n), 'MMM yyyy', lang)} – ${fmtDate(monthDate(5), 'MMM yyyy', lang)}`;

  const previous = [1, 2, 3].map((k) => fmtDate(monthDate(5 - k), 'MMMM yyyy', lang));

  const downloadPdf = () => {
    useApp.getState().toast(t('fte.rep.pdfToast'), 'info');
    window.print();
  };

  const downloadCsv = () => {
    const blob = new Blob([buildCsv(period, lang)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `pampa-burger-reporte-${SLUG[period]}.csv`;
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    useApp.getState().toast(t('fte.rep.csvToast', { file: name }));
  };

  return (
    <div>
      <PageHeader
        kicker={t('kicker.franquiciante')}
        title={t('fte.rep.title')}
        subtitle={t('fte.rep.subtitle')}
        actions={
          <div className="no-print flex flex-wrap gap-2">
            <button type="button" onClick={downloadPdf} className="btn-secondary">
              <Printer size={16} />
              {t('fte.rep.pdf')}
            </button>
            <button type="button" onClick={downloadCsv} className="btn-primary">
              <FileSpreadsheet size={16} />
              {t('fte.rep.csv')}
            </button>
          </div>
        }
      />
      <PreviewBanner bullets={[t('fte.rep.b1'), t('fte.rep.b2'), t('fte.rep.b3')]} />
      <DevNotice feature={t('fte.rep.pdfFeature')} now={t('fte.rep.pdfNow')} later={t('fte.rep.pdfLater')} />

      <div className="no-print mb-4">
        <Segmented<Period>
          value={period}
          onChange={setPeriod}
          scroll
          options={[
            { value: 'mes', label: t('fte.rep.pMonth') },
            { value: 'trimestre', label: t('fte.rep.pQuarter') },
            { value: 'semestre', label: t('fte.rep.pSix') },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card min-w-0 p-4 sm:p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div className="section-title text-base">{t('fte.rep.summary')}</div>
            <div className="text-xs capitalize text-muted">{range}</div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3 rounded-ctl bg-subtle p-3">
            <div className="min-w-0">
              <div className="kpi-label">{t('fte.rep.colRevenue')}</div>
              <div className="num mt-1 truncate text-sm text-ink sm:text-base">{fmtBRL(totRev)}</div>
            </div>
            <div className="min-w-0">
              <div className="kpi-label">{t('fte.rep.colTickets')}</div>
              <div className="num mt-1 truncate text-sm text-ink sm:text-base">{fmtInt(totTk)}</div>
            </div>
            <div className="min-w-0">
              <div className="kpi-label">{t('fte.rep.colAvg')}</div>
              <div className="num mt-1 truncate text-sm text-ink sm:text-base">{fmtTicket(totRev, totTk)}</div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="py-2.5 pr-3 font-semibold">{t('fte.rep.colUnit')}</th>
                  <th className="px-3 py-2.5 text-right font-semibold">{t('fte.rep.colRevenue')}</th>
                  <th className="hidden px-3 py-2.5 text-right font-semibold md:table-cell">{t('fte.rep.colTickets')}</th>
                  <th className="py-2.5 pl-3 text-right font-semibold">{t('fte.rep.colAvg')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ u, rev, tk }) => (
                  <tr key={u.id} className="border-b border-line">
                    <td className="py-3 pr-3">
                      <div className="font-medium text-ink">{u.name}</div>
                      <div className="text-xs text-muted">{u.franchisee}</div>
                    </td>
                    <td className="num px-3 py-3 text-right text-ink">{fmtBRL(rev)}</td>
                    <td className="num hidden px-3 py-3 text-right text-ink2 md:table-cell">{fmtInt(tk)}</td>
                    <td className="num py-3 pl-3 text-right text-ink2">{fmtTicket(rev, tk)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 pr-3 font-semibold text-ink">{t('fte.rep.total')}</td>
                  <td className="num px-3 py-3 text-right text-ink">{fmtBRL(totRev)}</td>
                  <td className="num hidden px-3 py-3 text-right text-ink md:table-cell">{fmtInt(totTk)}</td>
                  <td className="num py-3 pl-3 text-right text-ink">{fmtTicket(totRev, totTk)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <ul className="space-y-2 sm:hidden">
            {rows.map(({ u, rev, tk }) => (
              <li key={u.id} className="rounded-ctl border border-line p-3">
                <div className="truncate text-sm font-semibold text-ink">{u.name}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="text-muted">{t('fte.rep.colRevenue')}</div>
                    <div className="num truncate text-ink">{fmtBRL(rev)}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-muted">{t('fte.rep.colTickets')}</div>
                    <div className="num truncate text-ink">{fmtInt(tk)}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-muted">{t('fte.rep.colAvg')}</div>
                    <div className="num truncate text-ink">{fmtTicket(rev, tk)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card no-print p-4 sm:p-5">
          <div className="section-title mb-3 text-base">{t('fte.rep.previous')}</div>
          <ul className="divide-y divide-line">
            {previous.map((m) => (
              <li key={m}>
                <button
                  type="button"
                  onClick={() => useApp.getState().toast(t('fte.rep.prevToast', { month: m }), 'info')}
                  className="flex min-h-[52px] w-full items-center gap-3 py-2 text-left"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-ctl bg-accent-soft text-accent">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium capitalize text-ink">{m}</div>
                    <div className="text-xs text-muted">{t('fte.rep.prevMeta')}</div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
