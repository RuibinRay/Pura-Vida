import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useT, type MessageKey } from '../../i18n';
import { useSettings, useCalmMotion, type TimeMode } from '../../state/settings';
import { useTier } from '../../perf/tier';
import { HomeStill } from '../../scenes/home/HomeStill';
import { useHomeUI, type TourStep } from '../../scenes/home/sceneState';
import { startAmbience, stopAmbience, ambienceAvailable } from '../../audio/ambience';
import { Icon } from '../../ui/Icon';
import { SECTIONS } from '../sections';
import { usePageTitle } from '../usePageTitle';

const HomeScene = lazy(() => import('../../scenes/home/HomeScene').then((m) => ({ default: m.HomeScene })));

const TIME_MODES: TimeMode[] = ['auto', 'morning', 'afternoon', 'sunset', 'night', 'costaRica'];

export function HomePage() {
  const { t } = useT();
  usePageTitle();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tier = useTier((s) => s.tier);
  const calm = useCalmMotion();
  const introSeen = useSettings((s) => s.introSeen);
  const setIntroSeen = useSettings((s) => s.setIntroSeen);
  const timeMode = useSettings((s) => s.timeMode);
  const setTimeMode = useSettings((s) => s.setTimeMode);
  const sound = useSettings((s) => s.sound);
  const setSound = useSettings((s) => s.setSound);
  const paused = useSettings((s) => s.paused);
  const setPaused = useSettings((s) => s.setPaused);
  const tour = useHomeUI((s) => s.tour);
  const setTour = useHomeUI((s) => s.setTour);
  const hovered = useHomeUI((s) => s.hovered);
  const introPlaying = useHomeUI((s) => s.introPlaying);
  const live = tier === 'full' || tier === 'lite';
  const [playIntro, setPlayIntro] = useState(() => live && (!introSeen || params.get('replay') === '1'));
  const [ready, setReady] = useState(false);

  useEffect(() => () => { setTour(0); stopAmbience(); setSound(false); }, [setTour, setSound]);
  useEffect(() => { if (params.get('replay') === '1') { setPlayIntro(true); setParams({}, { replace: true }); } }, [params, setParams]);

  const onIntroEnd = useCallback(() => { setIntroSeen(true); setPlayIntro(false); }, [setIntroSeen]);
  const skipIntro = () => { setPlayIntro(false); setIntroSeen(true); };
  const toggleSound = async () => {
    if (sound) { stopAmbience(); setSound(false); return; }
    const ok = await startAmbience();
    setSound(ok);
  };
  const nextTour = () => { if (tour >= 4) { setTour(0); navigate('/explore'); } else setTour((tour + 1) as TourStep); };
  const tourKey = tour ? (('home.tour' + tour) as 'home.tour1' | 'home.tour2' | 'home.tour3' | 'home.tour4') : null;
  const hoverName = hovered === 'toucan' ? t('home.tour1.title') : hovered === 'sloth' ? t('home.tour2.title') : hovered === 'morpho' ? t('home.doorwayMorpho') : hovered === 'volcano' ? t('home.doorwayVolcano') : '';

  return (
    <>
      <section className={'hero on-dark' + (ready ? ' is-ready' : '') + (introPlaying ? ' is-intro' : '')} aria-label={t('home.sceneDescription')}>
        <HomeStill className={live ? 'home-still--preview' : ''} />
        {live && (
          <Suspense fallback={null}>
            <div className="hero__canvas" aria-hidden="true">
              <HomeScene playIntro={playIntro} onIntroEnd={onIntroEnd} onMorpho={() => navigate('/wildlife')} onVolcano={() => navigate('/explore')} onReady={() => setReady(true)} />
            </div>
          </Suspense>
        )}
        <div className="hero__ui">
          <div className="hero__tools ui">
            {live && introPlaying && (
              <button type="button" className="btn btn--glass" onClick={skipIntro}><Icon name="skip" /> {t('home.skipIntro')}</button>
            )}
            {live && !introPlaying && (
              <>
                <label className="glass-select">
                  <span className="visually-hidden">{t('home.timeLabel')}</span>
                  <Icon name={timeMode === 'night' ? 'moon' : 'sun'} />
                  <select value={timeMode} onChange={(e) => setTimeMode(e.target.value as TimeMode)} aria-label={t('home.timeLabel')}>
                    {TIME_MODES.map((m) => (<option key={m} value={m}>{t(('home.time.' + m) as MessageKey)}</option>))}
                  </select>
                </label>
                {ambienceAvailable() && (
                  <button type="button" className="btn btn--glass btn--icon" aria-pressed={sound} onClick={toggleSound} title={t('home.soundNote')} aria-label={sound ? t('home.soundOn') : t('home.soundOff')}>
                    <Icon name={sound ? 'sound' : 'mute'} />
                  </button>
                )}
                <button type="button" className="btn btn--glass btn--icon" aria-pressed={paused} onClick={() => setPaused(!paused)} aria-label={paused ? t('home.play') : t('home.pause')}>
                  <Icon name={paused ? 'play' : 'pause'} />
                </button>
              </>
            )}
          </div>

          <div className={'hero__title' + (introPlaying && !calm ? ' is-hidden' : '')}>
            <p className="hero__kicker ui">{t('nav.home')}</p>
            <h1 className="hero__h1">COSTA RICA</h1>
            <p className="hero__tagline">{t('site.tagline')}</p>
            <p className="hero__intro">“{t('site.intro')}”</p>
            <div className="hero__actions ui">
              <Link to="/explore" className="btn btn--primary btn--lg">{t('home.start')} <Icon name="arrow" /></Link>
              {live && <button type="button" className="btn btn--glass btn--lg" onClick={() => setTour(1)} title={t('home.tourAria')} disabled={tour !== 0}>{t('home.tour')}</button>}
            </div>
            {!live && <p className="hero__note ui">{t('home.stillNote')}</p>}
            {live && !introPlaying && <p className="hero__hint ui">{t('home.hint')}</p>}
          </div>

          <nav className={'doorways ui' + (introPlaying && !calm ? ' is-hidden' : '')} aria-label={t('home.doorways')}>
            <p className="eyebrow">{t('home.doorways')}</p>
            <ul>
              <li><Link to="/wildlife" className="doorway" style={{ ['--tab' as string]: 'var(--canopy)' }}><b>{t('home.doorwayMorpho')}</b><span>{t('home.doorwayMorphoTo')}</span></Link></li>
              <li><Link to="/explore" className="doorway" style={{ ['--tab' as string]: 'var(--ocean)' }}><b>{t('home.doorwayVolcano')}</b><span>{t('home.doorwayVolcanoTo')}</span></Link></li>
              <li><Link to="/provinces" className="doorway" style={{ ['--tab' as string]: 'var(--moss)' }}><b>{t('home.doorwayProvinces')}</b><span>{t('home.doorwayProvincesTo')}</span></Link></li>
              <li><Link to="/my-costa-rica" className="doorway" style={{ ['--tab' as string]: 'var(--gold)' }}><b>{t('home.doorwayMe')}</b><span>{t('home.doorwayMeTo')}</span></Link></li>
            </ul>
          </nav>

          {hoverName && !tour && <p className="hero__fieldnote note" aria-live="polite">{hoverName}</p>}

          {tourKey && (
            <div className="tour paper" role="dialog" aria-live="polite" aria-label={t('home.tour')}>
              <p className="eyebrow">{t('home.tour')} · {tour}/4</p>
              <h2 className="tour__title">{t((tourKey + '.title') as MessageKey)}</h2>
              <p className="tour__text">{t((tourKey + '.text') as MessageKey)}</p>
              <div className="tour__actions ui">
                <button type="button" className="btn btn--primary" onClick={nextTour}>{tour >= 4 ? t('home.endTour') : t('home.next')} <Icon name="arrow" /></button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTour(0)}>{t('home.closeTour')}</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="home-contents container" aria-labelledby="h-chapters">
        <div className="home-contents__intro">
          <p className="eyebrow">{t('home.chapters')}</p>
          <h2 id="h-chapters">{t('site.title')}</h2>
          <p className="lede">{t('home.chaptersIntro')}</p>
          <p className="note">{t('site.puraVidaMeaning')}</p>
        </div>
        <ol className="contents contents--home">
          {SECTIONS.filter((s) => s.id !== 'home').map((s, i) => (
            <li key={s.id} style={{ ['--tab' as string]: s.color }}>
              <span className="contents__n tnum">{String(i + 1).padStart(2, '0')}</span>
              {s.ready === true ? <Link to={s.path} className="contents__link">{t(s.labelKey)}</Link> : <span className="contents__soon">{t(s.labelKey)} <small>{t('nav.inPreparation', { n: s.ready })}</small></span>}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
