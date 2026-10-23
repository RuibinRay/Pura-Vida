import { useT, pickLang } from '../../i18n';
import { PERSONAL, type PersonalEntry } from '../../content/personal';
import { usePageTitle } from '../usePageTitle';

const isDraft = () => /[?&]draft/.test(window.location.search) || /[?&]draft/.test(window.location.hash);

export function MyCostaRicaPage() {
  const { t, lang } = useT();
  usePageTitle(t('my.title'));
  const draft = isDraft();
  const intro = pickLang(PERSONAL.introduction, lang);
  const entries = (key: keyof typeof PERSONAL, title: string) => {
    const list = PERSONAL[key] as PersonalEntry[];
    if (!Array.isArray(list)) return null;
    if (list.length === 0) return draft ? <Placeholder title={title} /> : null;
    return (
      <section className="chapter-part">
        <h2>{title}</h2>
        {list.map((e, i) => (
          <div key={i} className="prose"><h3 className="h-small">{pickLang(e.title, lang)}</h3><p>{pickLang(e.text, lang)}</p></div>
        ))}
      </section>
    );
  };
  const nothing = !intro && PERSONAL.photos.length === 0 && PERSONAL.favourites.length === 0 && PERSONAL.stories.length === 0 && PERSONAL.recommend.length === 0 && PERSONAL.experiences.length === 0 && PERSONAL.memories.length === 0;
  return (
    <article className="page container">
      <header className="page__head">
        <p className="eyebrow">{t('nav.myCostaRica')}</p>
        <h1>{t('my.title')}</h1>
        <p className="lede">{t('my.lede')}</p>
      </header>
      <section className="chapter-part">
        <h2>{t('my.why')}</h2>
        <p className="prose">{t('my.whyText')}</p>
        <p className="prose muted">{t('site.puraVidaMeaning')}</p>
      </section>
      {intro ? (
        <section className="chapter-part"><h2>{t('my.sections.introduction')}</h2><p className="prose">{intro}</p></section>
      ) : draft ? <Placeholder title={t('my.sections.introduction')} /> : null}
      {PERSONAL.photos.length > 0 ? (
        <section className="chapter-part"><h2>{t('my.sections.photos')}</h2>
          <ul className="photo-grid">{PERSONAL.photos.map((p) => (<li key={p.src}><img src={import.meta.env.BASE_URL + p.src} alt={pickLang(p.alt, lang)} loading="lazy" />{p.caption && <p className="muted"><small>{pickLang(p.caption, lang)}</small></p>}</li>))}</ul>
        </section>
      ) : draft ? <Placeholder title={t('my.sections.photos')} /> : null}
      {entries('favourites', t('my.sections.favourites'))}
      {entries('stories', t('my.sections.stories'))}
      {entries('recommend', t('my.sections.recommend'))}
      {entries('experiences', t('my.sections.experiences'))}
      {entries('memories', t('my.sections.memories'))}
      {nothing && (
        <aside className="placeholder-note paper">
          <p className="eyebrow">{t('my.placeholder')}</p>
          <p>{t('my.placeholderNote')}</p>
          <p className="muted"><small>{t('my.howToEdit')}</small></p>
        </aside>
      )}
    </article>
  );
}

function Placeholder({ title }: { title: string }) {
  const { t } = useT();
  return (
    <section className="chapter-part placeholder" aria-label={title}>
      <h2>{title}</h2>
      <p className="placeholder__box ui">{t('my.placeholder')} — src/content/personal.ts</p>
    </section>
  );
}
