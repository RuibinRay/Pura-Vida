// "Where I come from" — the author's own words and photographs.
// Nothing here is written on the author's behalf. Fill a field and it appears; empty fields stay hidden
// on the public site and show as marked placeholders only with ?draft in the URL.
import type { Localized } from '../i18n';

export interface PersonalPhoto {
  src: string; // put files in public/personal/ and reference them as 'personal/<file>.webp'
  alt: Localized;
  caption?: Localized;
}
export interface PersonalEntry {
  title: Localized;
  text: Localized;
}

export interface PersonalLinks {
  /** the author's own site (public) */
  website?: string;
  /** the repository of this site */
  github?: string;
  /** a contact address; left empty until the author chooses to publish one */
  email?: string;
}

/** The author's card: a few facts taken from his own home page (ruibinray.github.io), with the links it publishes. */
export const AUTHOR = {
  name: 'Ruibin (Ray) Jin Yao',
  tagline: { en: 'Building my own constellation.', es: 'Construyendo mi propia constelación.', zh: '构建我自己的星座。' } as Localized,
  bio: {
    en: 'Born in Costa Rica, with roots in China; a BBA in Finance & Business Analytics at Hult International Business School in Boston, working in energy and international business development. I explore where finance, business, analytics and technology meet — and a world still waiting to be discovered.',
    es: 'Nací en Costa Rica, con raíces en China; curso un BBA en Finanzas y Analítica de Negocios en Hult International Business School, en Boston, y trabajo en energía y desarrollo de negocios internacionales. Exploro el punto donde se cruzan las finanzas, los negocios, la analítica y la tecnología — y un mundo que aún queda por descubrir.',
    zh: '生于哥斯达黎加，根在中国；在波士顿的 Hult 国际商学院攻读金融与商业分析 BBA，从事能源与国际业务拓展。我探索金融、商业、分析与科技的交汇处——以及一个仍等待被发现的世界。',
  } as Localized,
  facts: [
    { label: { en: 'From', es: 'De', zh: '来自' }, value: { en: 'Costa Rica', es: 'Costa Rica', zh: '哥斯达黎加' } },
    { label: { en: 'Based in', es: 'Vivo en', zh: '现居' }, value: { en: 'Boston, MA', es: 'Boston, MA', zh: '美国波士顿' } },
    { label: { en: 'Studies', es: 'Estudios', zh: '学业' }, value: { en: 'BBA, Finance & Business Analytics — Hult International Business School', es: 'BBA en Finanzas y Analítica de Negocios — Hult International Business School', zh: '金融与商业分析 BBA — Hult 国际商学院' } },
    { label: { en: 'Languages', es: 'Idiomas', zh: '语言' }, value: { en: 'English · Español · 中文', es: 'English · Español · 中文', zh: 'English · Español · 中文' } },
  ] as { label: Localized; value: Localized }[],
  links: [
    { label: 'ruibinray.github.io', href: 'https://ruibinray.github.io/', kind: 'website' },
    { label: 'GitHub', href: 'https://github.com/RuibinRay', kind: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/edwin-ruibin-jin-yao-a6b050239', kind: 'linkedin' },
    { label: 'ruibinjinyao@gmail.com', href: 'mailto:ruibinjinyao@gmail.com', kind: 'email' },
  ] as { label: string; href: string; kind: string }[],
};

export const PERSONAL = {
  links: { website: 'https://ruibinray.github.io', github: 'https://github.com/RuibinRay/Pura-Vida', email: 'ruibinjinyao@gmail.com' } as PersonalLinks,
  introduction: { en: '', es: '', zh: '' } as Localized,
  photos: [] as PersonalPhoto[],
  favourites: [] as PersonalEntry[],
  stories: [] as PersonalEntry[],
  recommend: [] as PersonalEntry[],
  experiences: [] as PersonalEntry[],
  memories: [] as PersonalEntry[],
};
