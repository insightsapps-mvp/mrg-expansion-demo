import { Fragment, useEffect, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { fmtAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Avatar, FixedBottomBar, PageHeader, PreviewBanner, Segmented } from '@/components/ui';
import type { Message } from '@/types';
import { FDO_NAME, nowTime } from './_components/fdo';

type Thread = Message['thread'];

const THREADS: { id: Thread; name: string; descKey: string; replyAuthor: string; color: string }[] = [
  { id: 'mrg', name: 'MRG', descKey: 'fdo.msg.mrgDesc', replyAuthor: 'Paula Rinaldi · MRG', color: '#1769aa' },
  { id: 'marca', name: 'Pampa Burger', descKey: 'fdo.msg.marcaDesc', replyAuthor: 'Lucía Benítez · Pampa Burger', color: '#7c3aed' },
];

export default function FranchiseeMessages() {
  const { t, b, lang } = useT();
  const messages = useApp((s) => s.messages);
  const [thread, setThread] = useState<Thread>('mrg');
  const [text, setText] = useState('');
  const [typing, setTyping] = useState<Thread | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const mounted = useRef(false);

  const msgs = messages.filter((m) => m.thread === thread);
  const meta = THREADS.find((x) => x.id === thread)!;

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    const el = listRef.current;
    if (el && el.scrollHeight > el.clientHeight) el.scrollTo({ top: el.scrollHeight, behavior: mounted.current ? 'smooth' : 'auto' });
    else if (mounted.current) window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    mounted.current = true;
  }, [msgs.length, thread, typing]);

  const send = () => {
    const txt = text.trim();
    if (!txt) return;
    const th = thread;
    const s = useApp.getState();
    s.addMessage({ id: `m-${Date.now()}`, thread: th, from: 'me', author: FDO_NAME, daysAgo: 0, time: nowTime(), text: [txt, txt] });
    s.toast(tr('fdo.msg.sentToast', s.lang), 'ok');
    setText('');
    setTyping(th);
    const author = THREADS.find((x) => x.id === th)!.replyAuthor;
    const id = window.setTimeout(() => {
      const st = useApp.getState();
      st.addMessage({
        id: `m-${Date.now()}-r`,
        thread: th,
        from: 'them',
        author,
        daysAgo: 0,
        time: nowTime(),
        text: [tr('fdo.msg.autoReply', 'es'), tr('fdo.msg.autoReply', 'en')],
      });
      st.toast(tr('fdo.msg.replyToast', st.lang, { name: author.split(' · ')[0] }), 'info');
      setTyping(null);
    }, 1200);
    timers.current.push(id);
  };

  const lastOf = (th: Thread) => {
    const list = messages.filter((m) => m.thread === th);
    return list[list.length - 1];
  };

  const composer = (mobile: boolean) => (
    <form
      className={cn('flex w-full items-end gap-2', !mobile && 'border-t border-line p-3')}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        placeholder={t('fdo.msg.placeholder', { name: meta.name })}
        aria-label={t('fdo.msg.placeholder', { name: meta.name })}
        className="input max-h-32 min-h-[44px] flex-1 resize-none py-2.5 leading-snug"
      />
      <button type="submit" disabled={!text.trim()} className="btn-primary h-11 w-11 shrink-0 px-0" aria-label={t('common.send')}>
        <SendHorizontal size={18} />
      </button>
    </form>
  );

  return (
    <div>
      <PageHeader kicker={t('kicker.franquiciado')} title={t('fdo.msg.title')} subtitle={t('fdo.msg.subtitle')} />
      <PreviewBanner bullets={[t('fdo.msg.b1'), t('fdo.msg.b2'), t('fdo.msg.b3')]} />

      {/* Mobile: tabs */}
      <Segmented
        className="mb-4 w-full lg:hidden [&>button]:flex-1 [&>button]:justify-center [&>button]:min-h-[44px]"
        value={thread}
        onChange={setThread}
        options={THREADS.map((x) => ({ value: x.id, label: x.name, count: messages.filter((m) => m.thread === x.id).length }))}
      />

      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-4">
        {/* Desktop: lista de hilos */}
        <aside className="card hidden h-fit p-2 lg:block">
          <div className="kpi-label px-3 pb-2 pt-2">{t('fdo.msg.threads')}</div>
          {THREADS.map((x) => {
            const last = lastOf(x.id);
            const active = x.id === thread;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => setThread(x.id)}
                className={cn('flex min-h-[64px] w-full items-center gap-3 rounded-ctl px-3 py-2.5 text-left transition', active ? 'bg-accent-soft' : 'hover:bg-subtle')}
              >
                <Avatar name={x.name === 'MRG' ? 'M R' : x.name} color={x.color} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn('truncate text-sm font-semibold', active ? 'text-accent' : 'text-ink')}>{x.name}</span>
                    {last && <span className="shrink-0 text-[11px] text-muted">{last.daysAgo === 0 ? last.time : fmtAgo(last.daysAgo, lang)}</span>}
                  </span>
                  <span className="block truncate text-xs text-muted">{last ? b(last.text) : t(x.descKey)}</span>
                </span>
              </button>
            );
          })}
        </aside>

        {/* Conversación */}
        <section className="lg:flex lg:rounded-card lg:border lg:border-line lg:bg-card lg:shadow-sm lg:h-[min(640px,calc(100dvh-220px))] lg:flex-col lg:overflow-hidden">
          <div className="mb-3 flex items-center gap-3 lg:mb-0 lg:border-b lg:border-line lg:px-5 lg:py-3.5">
            <Avatar name={meta.name === 'MRG' ? 'M R' : meta.name} color={meta.color} size={36} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">{meta.name}</div>
              <div className="truncate text-xs text-muted">{t(meta.descKey)}</div>
            </div>
          </div>

          <div ref={listRef} className="flex flex-col gap-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-5 lg:py-4" aria-live="polite">
            {msgs.map((m, i) => {
              const newDay = i === 0 || msgs[i - 1].daysAgo !== m.daysAgo;
              const me = m.from === 'me';
              return (
                <Fragment key={m.id}>
                  {newDay && (
                    <div className="my-2 flex items-center gap-3 text-[11px] font-medium text-muted">
                      <span className="h-px flex-1 bg-line" />
                      {fmtAgo(m.daysAgo, lang)}
                      <span className="h-px flex-1 bg-line" />
                    </div>
                  )}
                  <div className={cn('fade-up flex', me ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[85%] sm:max-w-[70%]', me && 'text-right')}>
                      <div className={cn('mb-1 flex items-center gap-1.5 text-[11px] text-muted', me && 'justify-end')}>
                        <span className="truncate font-medium text-ink2">{me ? FDO_NAME : m.author}</span>
                        <span className="font-mono">{m.time}</span>
                      </div>
                      <div
                        className={cn(
                          'whitespace-pre-wrap break-words px-3.5 py-2.5 text-left text-sm leading-relaxed',
                          me ? 'rounded-[16px] rounded-br-[4px] bg-accent text-white dark:text-[#071a2e]' : 'rounded-[16px] rounded-bl-[4px] border border-line bg-subtle text-ink',
                        )}
                      >
                        {b(m.text)}
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
            {typing === thread && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1 rounded-[16px] rounded-bl-[4px] border border-line bg-subtle px-3.5 py-3" aria-label={t('fdo.msg.typing')}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block">{composer(false)}</div>
          <div className="hidden px-5 pb-2 text-[11px] text-muted lg:block">{t('fdo.msg.enterHint')}</div>
        </section>
      </div>

      <FixedBottomBar className="items-end">
        {composer(true)}
      </FixedBottomBar>
    </div>
  );
}
