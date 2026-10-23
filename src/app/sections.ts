import type { MessageKey } from '../i18n';

export interface Section {
  id: string;
  path: string;
  labelKey: MessageKey;
  /** short label for the index tab */
  tabKey?: MessageKey;
  /** CSS token used by the index tab and page accents */
  color: string;
  /** true = built; a number = planned milestone */
  ready: true | number;
  /** text colour on the tab: dark for light tab colours */
  ink?: 'dark';
}

export const SECTIONS: Section[] = [
  { id: 'home', path: '/', labelKey: 'nav.home', tabKey: 'nav.tab.home', color: 'var(--paper-edge)', ready: true, ink: 'dark' },
  { id: 'explore', path: '/explore', labelKey: 'nav.explore', tabKey: 'nav.tab.explore', color: 'var(--ocean)', ready: true },
  { id: 'provinces', path: '/provinces', labelKey: 'nav.provinces', tabKey: 'nav.tab.provinces', color: 'var(--moss-ink)', ready: true },
  { id: 'wildlife', path: '/wildlife', labelKey: 'nav.wildlife', tabKey: 'nav.tab.wildlife', color: 'var(--forest)', ready: true },
  { id: 'flora', path: '/flora', labelKey: 'nav.flora', color: 'var(--forest)', ready: 2 },
  { id: 'nature', path: '/nature', labelKey: 'nav.nature', color: 'var(--volcanic)', ready: 4 },
  { id: 'history', path: '/history', labelKey: 'nav.history', color: 'var(--wood)', ready: 3 },
  { id: 'food', path: '/food', labelKey: 'nav.food', tabKey: 'nav.tab.food', color: 'var(--sunset)', ready: true, ink: 'dark' },
  { id: 'culture', path: '/culture', labelKey: 'nav.culture', color: 'var(--wood)', ready: 3 },
  { id: 'symbols', path: '/symbols', labelKey: 'nav.symbols', color: 'var(--orchid)', ready: 3 },
  { id: 'conservation', path: '/conservation', labelKey: 'nav.conservation', color: 'var(--turquoise)', ready: 4, ink: 'dark' },
  { id: 'adventure', path: '/adventure', labelKey: 'nav.adventure', color: 'var(--gold)', ready: 4, ink: 'dark' },
  { id: 'my-costa-rica', path: '/my-costa-rica', labelKey: 'nav.myCostaRica', tabKey: 'nav.tab.myCostaRica', color: 'var(--gold)', ready: true, ink: 'dark' },
  { id: 'sources', path: '/sources', labelKey: 'nav.sources', tabKey: 'nav.tab.sources', color: 'var(--stone)', ready: true, ink: 'dark' },
];

export const READY_SECTIONS = SECTIONS.filter((s) => s.ready === true);
