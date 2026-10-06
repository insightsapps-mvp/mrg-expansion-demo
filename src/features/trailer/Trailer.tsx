import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MousePointer2, X } from 'lucide-react';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { sleep, WHATSAPP_URL } from '@/lib/utils';
import { LogoFull } from '@/components/Brand';
import type { Role } from '@/types';

export interface TrailerScene {
  view?: string;
  role?: Role;
  selector?: string;
  click?: boolean;
  position?: 'center' | 'top';
  chapter: string;
  title: string;
  body: string;
  duration: number;
  cta?: boolean;
  /** extensiones del motor */
  scroll?: string[];
  slide?: number;
}

const SCENES: TrailerScene[] = [
  { view: '/propuesta', role: 'admin', chapter: 'tr.ch1', title: 'tr.t1', body: 'tr.b1', duration: 8000, scroll: ['[data-trailer="circuito"]', '[data-trailer="modulos"]'] },
  { view: '/admin/crm', role: 'admin', selector: '[data-trailer="col-calificado"]', chapter: 'tr.ch2', title: 'tr.t2', body: 'tr.b2', duration: 6500 },
  { view: '/admin/crm', role: 'admin', selector: '[data-trailer="lead-L-001"]', click: true, chapter: 'tr.ch3', title: 'tr.t3', body: 'tr.b3', duration: 7500 },
  { view: '/admin/scoring', role: 'admin', selector: '[data-trailer="slider-capital"]', slide: 40, chapter: 'tr.ch4', title: 'tr.t4', body: 'tr.b4', duration: 8000 },
  { view: '/admin/propuestas/nueva?lead=L-001', role: 'admin', chapter: 'tr.ch5', title: 'tr.t5', body: 'tr.b5', duration: 5500 },
  { view: '/admin/propuestas/nueva?lead=L-001', role: 'admin', selector: '[data-trailer="btn-generar"]', click: true, chapter: 'tr.ch5', title: 'tr.t6', body: 'tr.b6', duration: 9000 },
  { view: '/admin/calendario', role: 'admin', selector: '[data-trailer="cal-week-btn"]', click: true, chapter: 'tr.ch7', title: 'tr.t7', body: 'tr.b7', duration: 6500 },
  { view: '/franquiciante/panel', role: 'franquiciante', selector: '[data-trailer="chart-facturacion"]', chapter: 'tr.ch8', title: 'tr.t8', body: 'tr.b8', duration: 7000 },
  { view: '/franquiciado/apertura', role: 'franquiciado', selector: '[data-trailer="apertura-progress"]', chapter: 'tr.ch9', title: 'tr.t9', body: 'tr.b9', duration: 7000 },
  { view: '/equipo/proyectos/pampa-eldorado', role: 'equipo', selector: '[data-trailer="board"]', chapter: 'tr.ch10', title: 'tr.t10', body: 'tr.b10', duration: 7000 },
  { chapter: 'tr.ch11', title: 'tr.t11', body: 'tr.b11', duration: 8000, cta: true, position: 'center' },
];

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function setRange(el: HTMLInputElement, value: number) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, String(value));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

export function Trailer() {
  const trailer = useApp((s) => s.trailer);
  const navigate = useNavigate();
  const navRef = useRef(navigate);
  navRef.current = navigate;
  const { t } = useT();
  const [i, setI] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0, show: false });
  const [ring, setRing] = useState<Box | null>(null);
  const [pressed, setPressed] = useState(false);
  const [sceneStart, setSceneStart] = useState(0);

  const exit = () => {
    const s = useApp.getState();
    s.setTrailer(false);
    s.setRole('admin');
    window.scrollTo(0, 0);
    navRef.current('/login');
  };

  useEffect(() => {
    if (!trailer) return;
    let cancelled = false;
    const alive = () => !cancelled && useApp.getState().trailer;
    setCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2, show: false });

    const run = async () => {
      let k = 0;
      while (alive()) {
        const sc = SCENES[k];
        setI(k);
        setRing(null);
        setSceneStart(Date.now());
        const t0 = Date.now();
        const s = useApp.getState();
        if (sc.role && s.role !== sc.role) {
          s.setRole(sc.role);
          await sleep(90);
        }
        if (sc.view) {
          const cur = window.location.pathname + window.location.search;
          if (cur !== sc.view) {
            navRef.current(sc.view);
            window.scrollTo(0, 0);
          }
          await sleep(650);
        }
        if (!alive()) return;

        if (sc.scroll) {
          for (const sel of sc.scroll) {
            document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            await sleep(2600);
            if (!alive()) return;
          }
        }

        if (sc.selector) {
          let el = document.querySelector<HTMLElement>(sc.selector);
          for (let tries = 0; !el && tries < 10; tries++) {
            await sleep(200);
            el = document.querySelector<HTMLElement>(sc.selector);
          }
          if (el && alive()) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            await sleep(550);
            const r = el.getBoundingClientRect();
            setRing({ x: r.left - 6, y: r.top - 6, w: r.width + 12, h: r.height + 12 });
            const tx = sc.slide !== undefined ? r.left + r.width * 0.35 : r.left + Math.min(r.width / 2, 120);
            const ty = r.top + Math.min(r.height / 2, 40);
            setCursor({ x: tx, y: ty, show: true });
            await sleep(1000);
            if (!alive()) return;
            if (sc.click) {
              setPressed(true);
              await sleep(160);
              setPressed(false);
              el.click();
              await sleep(500);
              setRing(null);
            }
            if (sc.slide !== undefined) {
              const input = (el.matches('input[type="range"]') ? el : el.querySelector('input[type="range"]')) as HTMLInputElement | null;
              if (input) {
                const from = Number(input.value);
                const steps = 14;
                for (let n = 1; n <= steps && alive(); n++) {
                  const v = Math.round(from + ((sc.slide - from) * n) / steps);
                  setRange(input, v);
                  const ir = input.getBoundingClientRect();
                  const pct = (v - Number(input.min || 0)) / (Number(input.max || 100) - Number(input.min || 0));
                  setCursor({ x: ir.left + ir.width * pct, y: ir.top + ir.height / 2, show: true });
                  await sleep(90);
                }
              }
            }
          }
        } else {
          setCursor((c) => ({ ...c, show: false }));
        }

        const rest = sc.duration - (Date.now() - t0);
        if (rest > 0) await sleep(rest);
        if (!alive()) return;
        k = (k + 1) % SCENES.length;
        if (k === 0) {
          // reinicio del loop: datos frescos de la vista de scoring
          window.scrollTo(0, 0);
        }
      }
    };
    run();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && exit();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelled = true;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailer]);

  // Mantener el anillo pegado al elemento si la página scrollea
  useEffect(() => {
    if (!trailer) return;
    const sel = SCENES[i]?.selector;
    if (!sel) return;
    const on = () => {
      const el = document.querySelector(sel);
      if (!el || !ring) return;
      const r = el.getBoundingClientRect();
      setRing({ x: r.left - 6, y: r.top - 6, w: r.width + 12, h: r.height + 12 });
    };
    window.addEventListener('scroll', on, true);
    return () => window.removeEventListener('scroll', on, true);
  }, [trailer, i, ring]);

  if (!trailer) return null;
  const sc = SCENES[i];

  return createPortal(
    <div data-no-print>
      {/* overlay: bloquea interacción del usuario, viñeta sutil */}
      <div className="fixed inset-0 z-[9990]" style={{ background: sc.cta ? 'rgba(7,26,46,.92)' : 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.18))' }} />
      {ring && (
        <div
          className="pointer-events-none fixed z-[9991] rounded-[16px] transition-all duration-500"
          style={{ left: ring.x, top: ring.y, width: ring.w, height: ring.h, boxShadow: '0 0 0 3px var(--accent), 0 0 0 9px color-mix(in srgb, var(--accent) 22%, transparent)' }}
        />
      )}
      {cursor.show && (
        <div className="pointer-events-none fixed z-[9992]" style={{ left: cursor.x, top: cursor.y, transition: 'left .9s cubic-bezier(.65,0,.35,1), top .9s cubic-bezier(.65,0,.35,1)' }}>
          <MousePointer2 size={30} className="drop-shadow-lg" style={{ fill: '#2d9cdb', color: '#fff', scale: pressed ? '0.82' : '1', transition: 'scale .12s' }} />
          {pressed && <span className="absolute -left-3 -top-3 h-8 w-8 animate-ping rounded-full bg-[#2d9cdb]/50" />}
        </div>
      )}
      {sc.cta ? (
        <div className="fixed inset-0 z-[9993] m-auto flex h-fit w-[min(640px,calc(100vw-32px))] flex-col items-center text-center text-white">
          <LogoFull white className="h-12" />
          <h2 className="mt-8 text-[44px] font-bold leading-tight tracking-tight">{t(sc.title)}</h2>
          <p className="mt-3 text-lg text-white/70">{t(sc.body)}</p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn mt-8 bg-white px-7 text-base text-[#071a2e] hover:bg-white/90">
            <MessageCircle size={18} />
            {t('tr.cta')}
          </a>
          <div className="mt-6 text-[10px] uppercase tracking-[0.16em] text-white/50">Powered by Insights</div>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-8 z-[9993] mx-auto w-[min(720px,calc(100vw-48px))] overflow-hidden rounded-panel border border-white/20 bg-[rgba(7,26,46,.72)] px-6 py-4 text-white shadow-md backdrop-blur-xl">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7cc4ee]">
            <span className="num">{String(i + 1).padStart(2, '0')} / {SCENES.length}</span>
            <span className="h-3 w-px bg-white/25" />
            {t(sc.chapter)}
          </div>
          <div className="mt-1.5 text-[20px] font-semibold tracking-tight">{t(sc.title)}</div>
          <div className="mt-0.5 text-[14px] text-white/75">{t(sc.body)}</div>
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
            <div key={sceneStart} className="h-full bg-[#2d9cdb]" style={{ animation: `trailerbar ${sc.duration}ms linear both` }} />
          </div>
        </div>
      )}
      <button onClick={exit} className="fixed right-5 top-[80px] z-[9994] inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 bg-[rgba(7,26,46,.75)] px-4 text-sm font-medium text-white backdrop-blur-md hover:bg-[rgba(7,26,46,.9)]">
        <X size={16} />
        {t('tr.exit')} <span className="text-white/50">Esc</span>
      </button>
    </div>,
    document.body,
  );
}
