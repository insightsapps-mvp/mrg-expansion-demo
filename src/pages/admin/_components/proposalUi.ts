import type { ProposalStatus } from '@/types';

export const statusTone: Record<ProposalStatus, 'neutral' | 'accent' | 'ok' | 'danger'> = {
  borrador: 'neutral',
  enviada: 'accent',
  aceptada: 'ok',
  rechazada: 'danger',
};

export type DiffToken = { text: string; kind: 'same' | 'add' | 'del' };

/** Tokeniza por palabras conservando los saltos de línea como tokens propios. */
const tokenize = (s: string) => s.split(/( |\n)/).filter((x) => x !== '' && x !== ' ');

/** Diff por palabras con LCS simple (O(n·m)). */
export function wordDiff(before: string, after: string): DiffToken[] {
  const a = tokenize(before);
  const b = tokenize(after);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ text: a[i], kind: 'same' });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ text: a[i++], kind: 'del' });
    } else {
      out.push({ text: b[j++], kind: 'add' });
    }
  }
  while (i < n) out.push({ text: a[i++], kind: 'del' });
  while (j < m) out.push({ text: b[j++], kind: 'add' });
  return out;
}

export const diffChanges = (d: DiffToken[]) => d.filter((x) => x.kind !== 'same' && x.text !== '\n').length;
