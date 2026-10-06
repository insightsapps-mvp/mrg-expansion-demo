import { useApp } from '@/store';
import { cn } from '@/lib/utils';

/** Logo oficial de Mercosur Retail Group (versión navy / blanca según tema o fondo). */
export function LogoFull({ className, white }: { className?: string; white?: boolean }) {
  const theme = useApp((s) => s.theme);
  const useWhite = white ?? theme === 'dark';
  return (
    <img
      src={useWhite ? '/brand/logo-white.png' : '/brand/logo-navy.png'}
      alt="MRG · Mercosur Retail Group"
      className={cn('h-9 w-auto select-none', className)}
      draggable={false}
    />
  );
}

/** Isotipo circular (Sudamérica) */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/brand/mark.png"
      alt="MRG"
      width={size}
      height={size}
      className={cn('shrink-0 select-none rounded-full', className)}
      draggable={false}
    />
  );
}

/** Wordmark compacto: isotipo + "MRG" + punto en el acento */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark size={30} />
      <span className="font-serif text-[22px] font-semibold leading-none tracking-wide text-ink">
        MRG<span className="text-accent">.</span>
      </span>
    </span>
  );
}
