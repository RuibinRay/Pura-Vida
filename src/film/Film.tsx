// The home page: one film of Costa Rica, scrubbed frame by frame with the scroll. A sticky stage holds the canvas
// and the captions; the page's height is the film's length. The shots, their frames and the way the picture is
// drawn live in shots.ts, frames.ts and usePlayer.ts — this file is the page around them: the captions, the chapter
// rail, the play button, the notes on how the film was made, and the versions for reduced motion and the text tier.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '../ui/Link';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';
import { useT, type MessageKey } from '../i18n';
import { useCalmMotion, useSettings } from '../state/settings';
import { useTier } from '../perf/tier';
import { startAmbience, stopAmbience, ambienceAvailable } from '../audio/ambience';
import { SECTIONS } from '../app/sections';
import { CHAPTERS, FILM, posterUrl, type Shot } from './shots';
import { usePlayer } from './usePlayer';
import { photoCredit, PHOTO_CREDITS, FILM_SOURCES } from './photoCredits';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const pad = (n: number) => String(n).padStart(2, '0');

export function Film() {
  const { t } = useT();
  const tier = useTier((s) => s.tier);
  const calm = useCalmMotion();
  const motionPref = useSettings((s) => s.motion);
  const setMotion = useSettings((s) => s.setMotion);
  const { shots, total } = FILM;

  if (tier === 'text') return <FilmText />;

  const still = calm || tier === 'still';
  return <FilmStage key={still ? 'still' : 'live'} still={still} lite={tier !== 'full'} shots={shots} total={total} notice={calm && motionPref === 'auto' ? () => setMotion('full') : undefined} note={!calm && tier === 'still' ? t('film.stillNote') : undefined} />;
}

function FilmStage({ still, lite, shots, total, notice, note }: { still: boolean; lite: boolean; shots: Shot[]; total: number; notice?: () => void; note?: string }) {
  const { t } = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capRefs = useRef<(HTMLElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [notes, setNotes] = useState(false);
  const [noticeOff, setNoticeOff] = useState(false);

  const onShot = useCallback((i: number) => setCurrent(i), []);
  const onEnd = useCallback(() => setPlaying(false), []);
  const player = usePlayer({ root: rootRef, canvas: canvasRef, captions: capRefs, still, lite, playing, onShot, onEnd });

  // the film playing itself stops the moment the visitor takes the scroll back
  useEffect(() => {
    if (!playing) return;
    const stop = () => setPlaying(false);
    const key = (e: KeyboardEvent) => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(e.key)) stop(); };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', key); };
  }, [playing]);

  const sound = useSettings((s) => s.sound);
  const setSound = useSettings((s) => s.setSound);
  useEffect(() => () => { stopAmbience(); setSound(false); }, [setSound]);
  const toggleSound = async () => { if (sound) { stopAmbience(); setSound(false); return; } setSound(await startAmbience()); };

  const goTo = (i: number) => { setPlaying(false); player.current?.goTo(i, !still); };
  const togglePlay = () => {
    if (!playing && (player.current?.progress() ?? 0) > 0.995) player.current?.goTo(0, false);
    setPlaying((p) => !p);
  };

  const chapters = useMemo(() => CHAPTERS.map((id) => ({ id, first: shots.findIndex((s) => s.chapter === id) })).filter((c) => c.first >= 0), [shots]);
  const chapter = shots[current]?.chapter;
  const last = shots.length - 1;
  const ready = SECTIONS.filter((s) => s.id !== 'home' && s.ready === true);

  return (
    <div ref={rootRef} className={'film on-dark' + (still ? ' film--still' : '') + (playing ? ' is-playing' : '')} style={{ height: `calc(${total.toFixed(0)}vh + 100vh)` }} data-shot={shots[current]?.id}>
      <a className="skip-link ui" href="#film-end" onClick={(e) => { e.preventDefault(); goTo(last); window.setTimeout(() => document.getElementById('film-end')?.focus({ preventScroll: true }), still ? 80 : 1100); /* once the scroll has arrived and the caption is up */ }}>{t('film.skip')}</a>
      <div className="film__stage">
        <canvas ref={canvasRef} className="film__canvas" role="img" aria-label={t('film.label', { n: shots.length })} />
        <div className="film__shade" aria-hidden="true" />

        <div className="film__captions">
          {shots.map((s, i) => {
            const k = `film.shots.${s.id}` as const;
            const credit = s.photo ? photoCredit(s.photo) : undefined;
            const madeLine = s.made === 'photo' && credit ? t('film.made.photo', { author: credit.author, licence: credit.licence }) : t(`film.made.${s.made === 'photo' ? 'generated' : s.made}` as MessageKey);
            const hero = i === 0;
            const end = i === last;
            return (
              <section key={s.id} ref={(el) => { capRefs.current[i] = el; }} className={`fcap fcap--${s.side}` + (hero ? ' fcap--hero' : '') + (end ? ' fcap--end' : '')} aria-labelledby={`fcap-${s.id}`} style={{ opacity: hero ? 1 : 0, visibility: hero ? 'visible' : 'hidden' }} id={end ? 'film-end' : undefined} tabIndex={end ? -1 : undefined}>
                {hero ? (
                  <>
                    <p className="fcap__kicker ui">{t(`${k}.kicker` as MessageKey)}</p>
                    <h1 id={`fcap-${s.id}`} className="fcap__h1">{t('film.hero.title')}</h1>
                    <p className="fcap__tagline">{t('film.hero.tagline')}</p>
                    <p className="fcap__intro">{t('film.hero.intro')}</p>
                    <div className="fcap__actions ui">
                      <button type="button" className="btn btn--primary btn--lg" onClick={togglePlay}><Icon name={playing ? 'pause' : 'play'} /> {playing ? t('film.pause') : t('film.play')}</button>
                      <Link to="/explore" className="btn btn--glass btn--lg">{t('film.open.map')}</Link>
                    </div>
                    <p className="fcap__fact">{t(`${k}.text` as MessageKey)}</p>
                    {!still && <p className="fcap__hint ui" aria-hidden="true"><span /> {t('film.scrollHint')}</p>}
                  </>
                ) : (
                  <>
                    <p className="fcap__kicker ui"><span className="tnum">{pad(i + 1)}</span> {t(`${k}.kicker` as MessageKey)}</p>
                    <h2 id={`fcap-${s.id}`} className="fcap__h2">{t(`${k}.title` as MessageKey)}</h2>
                    <p className="fcap__text">{t(`${k}.text` as MessageKey)}</p>
                    {end ? (
                      <>
                        <ul className="fcap__chapters ui">
                          {ready.map((sec) => (<li key={sec.id}><Link to={sec.path} className="chip chip--section" style={{ ['--tab' as string]: sec.color }}>{t(sec.labelKey)}</Link></li>))}
                          <li><Link to="/walk" className="chip chip--section" style={{ ['--tab' as string]: 'var(--leaf)' }}>{t('film.end.walk')}</Link></li>
                        </ul>
                        <p className="fcap__links ui">
                          <button type="button" className="btn btn--glass btn--sm" onClick={() => goTo(0)}><Icon name="back" /> {t('film.replay')}</button>
                          <button type="button" className="btn btn--link" onClick={() => setNotes(true)}>{t('film.about')}</button>
                          <Link to="/sources">{t('film.end.sources')}</Link>
                        </p>
                      </>
                    ) : s.link ? (
                      <p className="fcap__links ui"><Link to={s.link.to} className="btn btn--glass btn--sm">{t(`film.open.${s.link.label}` as MessageKey)} <Icon name="arrow" /></Link></p>
                    ) : null}
                  </>
                )}
                <p className="fcap__made ui"><small>{madeLine}</small></p>
              </section>
            );
          })}
        </div>

        <div className="film__bar ui">
          <button type="button" className="film__tag" onClick={() => setNotes(true)} aria-haspopup="dialog">
            <Icon name="spark" size={14} /> <span>{shots[current]?.made === 'map' ? t('film.about') : t('film.aiTag')}</span>
          </button>
          <span className="film__count tnum" aria-live="off">{t('film.shotOf', { n: current + 1, total: shots.length })}</span>
          <span className="film__ctl">
            {!still && (
              <button type="button" className="film__btn" onClick={togglePlay} aria-pressed={playing} aria-label={playing ? t('film.pause') : t('film.play')} title={playing ? t('film.pause') : t('film.play')}>
                <Icon name={playing ? 'pause' : 'play'} />
              </button>
            )}
            {ambienceAvailable() && (
              <button type="button" className="film__btn" onClick={toggleSound} aria-pressed={sound} title={t('journey.soundNote')} aria-label={sound ? t('journey.soundOn') : t('journey.soundOff')}>
                <Icon name={sound ? 'sound' : 'mute'} />
              </button>
            )}
          </span>
        </div>
        <div className="film__progress" aria-hidden="true"><i /></div>
        {playing && <p className="visually-hidden" role="status">{t('film.playing')}</p>}
        {note && <p className="film__note ui">{note}</p>}
      </div>

      <nav className="film-rail ui" aria-label={t('film.railLabel')}>
        <ol>
          {chapters.map((c, n) => (
            <li key={c.id}>
              <button type="button" className={'film-rail__item' + (chapter === c.id ? ' is-current' : '')} aria-current={chapter === c.id ? 'step' : undefined} onClick={() => goTo(c.first)}>
                <span className="film-rail__n tnum">{pad(n + 1)}</span>
                <span className="film-rail__label">{t(`film.chapters.${c.id}` as MessageKey)}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {notice && !noticeOff && (
        <div className="motion-notice ui" role="status">
          <p>{t('film.motionOff')}</p>
          <div className="motion-notice__actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={notice}>{t('journey.motionOn')}</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setNoticeOff(true)}>{t('journey.motionKeep')}</button>
          </div>
        </div>
      )}

      <Sheet open={notes} onClose={() => setNotes(false)} title={t('film.about')}>
        <FilmNotes count={shots.length} />
      </Sheet>
    </div>
  );
}

/** How the film was made, and who took the photographs it starts from. */
function FilmNotes({ count }: { count: number }) {
  const { t } = useT();
  return (
    <div className="film-notes">
      <p>{t('film.notes.intro', { n: count })}</p>
      <ul>
        <li>{t('film.notes.map')}</li>
        <li>{t('film.notes.generated')}</li>
        <li>{t('film.notes.scene')}</li>
        <li>{t('film.notes.photo')}</li>
      </ul>
      <h3>{t('film.notes.photos')}</h3>
      <ul className="film-notes__photos">
        {PHOTO_CREDITS.map((c) => (
          <li key={c.key}>
            <a href={c.page} rel="noopener">{c.title}</a> — {c.author}, <a href={c.licenceUrl} rel="noopener license">{c.licence}</a>
          </li>
        ))}
      </ul>
      <p className="muted"><small>{t('film.notes.facts')}</small></p>
      <ul className="film-notes__photos">
        {FILM_SOURCES.map((src) => (<li key={src.url}><a href={src.url} rel="noopener">{src.title}</a> — {src.publisher}</li>))}
      </ul>
      <p className="ui"><Link to="/sources" className="btn btn--ghost btn--sm">{t('film.end.sources')}</Link></p>
    </div>
  );
}

/** The text tier: the film as a page of stills and their captions. */
function FilmText() {
  const { t } = useT();
  const { shots } = FILM;
  return (
    <article className="film-text container">
      <header>
        <h1>{t('film.hero.title')}</h1>
        <p className="film-text__lead">{t('film.hero.intro')}</p>
      </header>
      <ol>
        {shots.map((s, i) => {
          const k = `film.shots.${s.id}`;
          const credit = s.photo ? photoCredit(s.photo) : undefined;
          return (
            <li key={s.id}>
              <img src={posterUrl(BASE, s.id)} alt="" loading={i < 2 ? 'eager' : 'lazy'} width={1920} height={1080} />
              <p className="fcap__kicker ui"><span className="tnum">{pad(i + 1)}</span> {t(`${k}.kicker` as MessageKey)}</p>
              <h2>{t(`${k}.title` as MessageKey)}</h2>
              <p>{t(`${k}.text` as MessageKey)}</p>
              <p className="muted"><small>{s.made === 'photo' && credit ? t('film.made.photo', { author: credit.author, licence: credit.licence }) : t(`film.made.${s.made === 'photo' ? 'generated' : s.made}` as MessageKey)}</small></p>
              {s.link && <p className="ui"><Link to={s.link.to}>{t(`film.open.${s.link.label}` as MessageKey)}</Link></p>}
            </li>
          );
        })}
      </ol>
      <p className="ui"><Link to="/walk">{t('film.end.walk')}</Link> · <Link to="/sources">{t('film.end.sources')}</Link></p>
    </article>
  );
}
