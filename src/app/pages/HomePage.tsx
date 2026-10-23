// The homepage is one scroll journey in six chapters over a sticky stage (see docs/HOMEPAGE_REDESIGN.md).
// Chapter sections hold the copy and scroll past; the stage shows the plate, the map, the table and the end card.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT, type MessageKey } from '../../i18n';
import { useCalmMotion, useSettings } from '../../state/settings';
import { useTier } from '../../perf/tier';
import { useContent } from '../../content';
import { useMapData } from '../../map/useMapData';
import { useMap, PROVINCE_IDS, type ProvinceId } from '../../state/map';
import { PROVINCE_COLORS } from '../../map/geo';
import { useJourneyDriver, journey, onJourney, scrollToChapter, CHAPTER_COUNT } from '../../journey/driver';
import { HeroPlate } from '../../journey/HeroPlate';
import { WildlifePlate } from '../../journey/WildlifePlate';
import { FlavorsTable } from '../../journey/FlavorsTable';
import { ClosingPlate } from '../../journey/ClosingPlate';
import { NatureFacts } from '../../journey/NatureFacts';
import { PERSONAL } from '../../content/personal';
import { startAmbience, stopAmbience, ambienceAvailable } from '../../audio/ambience';
import { Icon } from '../../ui/Icon';
import { SECTIONS } from '../sections';
import { usePageTitle } from '../usePageTitle';

const HomeMap = lazy(() => import('../../journey/HomeMap').then((m) => ({ default: m.HomeMap })));
const Map2D = lazy(() => import('../../map/Map2D').then((m) => ({ default: m.Map2D })));

const CHAPTER_KEYS = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'] as const;

export function HomePage() {
  const { t, l, lang } = useT();
  usePageTitle();
  const navigate = useNavigate();
  const calm = useCalmMotion();
  const tier = useTier((s) => s.tier);
  const live = tier === 'full' || tier === 'lite';
  const content = useContent();
  const { data: mapData } = useMapData();
  const rootRef = useRef<HTMLDivElement>(null);
  useJourneyDriver(rootRef, calm);

  // which stage pieces are mounted: later plates wait until the visitor approaches them
  const [reach, setReach] = useState(0);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    const update = () => {
      setReach((r) => (journey.t > r ? journey.t : r));
      setChapter((c) => (journey.chapter === c ? c : journey.chapter));
    };
    update();
    return onJourney(update);
  }, []);

  const sound = useSettings((s) => s.sound);
  const setSound = useSettings((s) => s.setSound);
  useEffect(() => () => { stopAmbience(); setSound(false); }, [setSound]);
  const toggleSound = async () => { if (sound) { stopAmbience(); setSound(false); return; } setSound(await startAmbience()); };

  const openProvince = useCallback((id: ProvinceId) => navigate('/provinces/' + id), [navigate]);
  const hover = useMap((s) => s.hover);
  const select = useMap((s) => s.select);
  const hovered = useMap((s) => s.hovered);
  // the 2D fallback map selects through the same store; open the chapter when it does
  const selected2d = useMap((s) => s.selected);
  useEffect(() => { if (!live && selected2d && journey.chapter === 2) openProvince(selected2d); }, [live, selected2d, openProvince]);

  const goTo = (i: number) => { if (rootRef.current) scrollToChapter(rootRef.current, i, !calm); };
  const provinceLine = (id: ProvinceId) => {
    const p = content?.provinces.find((x) => x.id === id);
    if (!p) return '';
    const text = l(p.overview);
    const first = text.split(/(?<=[.!?。])\s+/)[0] || text;
    return first.length > 140 ? first.slice(0, 137).replace(/\s+\S*$/, '') + '…' : first;
  };
  const website = PERSONAL.links?.website;
  const github = PERSONAL.links?.github || 'https://github.com/RuibinRay/Pura-Vida';
  const email = PERSONAL.links?.email;

  return (
    <div ref={rootRef} className={'journey' + (live ? ' journey--live' : ' journey--still')} data-chapter="1">
      <div className="journey__stage">
        <HeroPlate live={live} />
        {reach > 1.2 && mapData && (
          <div className="stage__map">
            <Suspense fallback={null}>
              {live ? <HomeMap data={mapData} onOpen={openProvince} /> : <div className="home-map home-map--2d"><Map2D data={mapData} landmarks={[]} /></div>}
            </Suspense>
          </div>
        )}
        {reach > 2.4 && content && <WildlifePlate species={content.species} />}
        {reach > 3.4 && content && <FlavorsTable foods={content.foods} />}
        {reach > 4.3 && <ClosingPlate />}
        <div className="journey__copy">
      {/* ---- 01 Discover ---- */}
      <section className="jchapter jchapter--1" aria-labelledby="ch1-title">
        <div className="jcopy jcopy--hero on-dark">
          <p className="jcopy__kicker">01 / {t('journey.ch1.kicker')}</p>
          <h1 id="ch1-title" className="jcopy__h1">COSTA RICA</h1>
          <p className="jcopy__tagline">{t('journey.ch1.tagline')}</p>
          <p className="jcopy__intro">{t('journey.ch1.intro')}</p>
          <div className="jcopy__actions ui">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => goTo(1)}>{t('journey.ch1.begin')} <Icon name="chevron" /></button>
            <Link to="/explore" className="btn btn--glass btn--lg">{t('journey.ch1.openMap')}</Link>
          </div>
          {!live && <p className="jcopy__note ui">{t('journey.stillNote')}</p>}
          <p className="jcopy__scrollhint ui" aria-hidden="true"><span /> {t('journey.scrollHint')}</p>
        </div>
        <p className="visually-hidden">{t('journey.ch1.plateAlt')}</p>
      </section>

      {/* ---- 02 Nature ---- */}
      <section className="jchapter jchapter--2" aria-labelledby="ch2-title">
        <div className="jcopy jcopy--panel on-dark">
          <p className="jcopy__kicker">02 / {t('journey.ch2.kicker')}</p>
          <h2 id="ch2-title" className="jcopy__h2">{t('journey.ch2.title')}</h2>
          <p className="jcopy__text">{t('journey.ch2.text')}</p>
          {content ? <NatureFacts facts={content.country} /> : <p className="muted">{t('common.loading')}</p>}
          <p className="jcopy__links ui">
            <Link to="/explore">{t('journey.ch2.toMap')}</Link>
            <Link to="/nature">{t('nav.nature')} <small>· {t('journey.soon')}</small></Link>
            <Link to="/conservation">{t('nav.conservation')} <small>· {t('journey.soon')}</small></Link>
          </p>
          <p className="jcopy__caption"><small>{t('journey.ch2.plateCaption')}</small></p>
        </div>
      </section>

      {/* ---- 03 Provinces ---- */}
      <section className="jchapter jchapter--3" aria-labelledby="ch3-title">
        <div className="jcopy jcopy--panel jcopy--right on-dark">
          <p className="jcopy__kicker">03 / {t('journey.ch3.kicker')}</p>
          <h2 id="ch3-title" className="jcopy__h2">{t('journey.ch3.title')}</h2>
          <p className="jcopy__text">{t('journey.ch3.text')}</p>
          <ol className="province-list" aria-label={t('journey.ch3.listLabel')}>
            {PROVINCE_IDS.map((id) => {
              const geo = mapData?.provinces.find((p) => p.id === id);
              const name = geo ? (geo.name[lang] || geo.name.en) : id;
              return (
                <li key={id} style={{ ['--swatch' as string]: PROVINCE_COLORS[id] }}>
                  <button type="button" className={'province-list__btn' + (hovered === id ? ' is-on' : '')} onPointerEnter={() => hover(id)} onPointerLeave={() => hover(null)} onFocus={() => hover(id)} onBlur={() => hover(null)} onClick={() => (live ? select(id, false) : openProvince(id))}>
                    <b>{name}</b>
                    <span>{provinceLine(id)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="jcopy__links ui"><Link to="/provinces">{t('journey.ch3.all')}</Link><Link to="/explore">{t('journey.ch3.fullMap')}</Link></p>
          <p className="jcopy__caption"><small>{t('explore.reliefNote')}</small></p>
        </div>
      </section>

      {/* ---- 04 Wildlife ---- */}
      <section className="jchapter jchapter--4" aria-labelledby="ch4-title">
        <div className="jcopy jcopy--panel jcopy--top on-dark">
          <p className="jcopy__kicker">04 / {t('journey.ch4.kicker')}</p>
          <h2 id="ch4-title" className="jcopy__h2">{t('journey.ch4.title')}</h2>
          <p className="jcopy__text">{t('journey.ch4.text')}</p>
          <p className="jcopy__links ui"><Link to="/wildlife">{t('journey.ch4.all')}</Link></p>
          <p className="jcopy__caption"><small>{t('journey.ch4.plateCredit')}</small></p>
        </div>
        {/* keyboard/screen-reader route to the same five entries */}
        <ul className="visually-hidden">
          {content?.species.filter((s) => ['brown-throated-three-toed-sloth', 'white-faced-capuchin', 'scarlet-macaw', 'central-american-agouti', 'green-iguana'].includes(s.id)).map((s) => (
            <li key={s.id}><Link to={'/wildlife?focus=' + s.id}>{l(s.commonNames)} — {s.scientific}</Link></li>
          ))}
        </ul>
      </section>

      {/* ---- 05 Culture ---- */}
      <section className="jchapter jchapter--5" aria-labelledby="ch5-title">
        <div className="jcopy jcopy--panel jcopy--top on-dark">
          <p className="jcopy__kicker">05 / {t('journey.ch5.kicker')}</p>
          <h2 id="ch5-title" className="jcopy__h2">{t('journey.ch5.title')}</h2>
          <p className="jcopy__text">{t('journey.ch5.text')}</p>
          <p className="jcopy__links ui"><Link to="/food">{t('journey.ch5.all')}</Link><Link to="/culture">{t('nav.culture')} <small>· {t('journey.soon')}</small></Link></p>
        </div>
        <ul className="visually-hidden">
          {content?.foods.map((f) => (<li key={f.id}><Link to={'/food?focus=' + f.id}>{l(f.name)}</Link></li>))}
        </ul>
      </section>

      {/* ---- 06 The story continues ---- */}
      <section className="jchapter jchapter--6" aria-labelledby="ch6-title">
        <div className="jcopy jcopy--close on-dark">
          <p className="jcopy__kicker">06 / {t('journey.ch6.kicker')}</p>
          <h2 id="ch6-title" className="jcopy__h2">{t('journey.ch6.title')}</h2>
          <blockquote className="jcopy__quote"><p>{t('journey.ch6.quote')}</p></blockquote>
          <p className="jcopy__text">{t('journey.ch6.text')}</p>
          <ul className="closing-links ui">
            {website && <li><a href={website} rel="me noopener">{t('journey.ch6.website')} <Icon name="external" /></a></li>}
            <li><a href={github} rel="noopener">{t('journey.ch6.github')} <Icon name="external" /></a></li>
            {email ? <li><a href={'mailto:' + email}>{t('journey.ch6.contact')}</a></li> : <li><Link to="/my-costa-rica">{t('journey.ch6.contact')}</Link></li>}
            <li><Link to="/my-costa-rica">{t('nav.myCostaRica')}</Link></li>
          </ul>
          <p className="jcopy__kicker jcopy__kicker--sub">{t('journey.ch6.explore')}</p>
          <ul className="chips-row ui">
            {SECTIONS.filter((s) => s.id !== 'home' && s.ready === true).map((s) => (
              <li key={s.id}><Link to={s.path} className="chip chip--section" style={{ ['--tab' as string]: s.color }}>{t(s.labelKey)}</Link></li>
            ))}
          </ul>
          <p className="jcopy__caption">
            <small>{t('journey.ch6.coming')}: {SECTIONS.filter((s) => s.ready !== true).map((s) => t(s.labelKey)).join(' · ')}.</small>
          </p>
          <p className="jcopy__links ui"><Link to="/sources">{t('nav.sources')}</Link><button type="button" className="btn btn--link" onClick={() => goTo(0)}>{t('journey.ch6.again')}</button></p>
          <p className="jcopy__caption"><small>{t('journey.ch6.plateCredit')}</small></p>
        </div>
      </section>
              </div>
      </div>

      {/* scroll length for each chapter; the copy and the visuals live in the stage and read --p1…--p6 */}
      {CHAPTER_KEYS.map((k, i) => (<div key={k} className={'jspace jspace--' + (i + 1)} data-chapter={i + 1} aria-hidden="true" />))}
      <span className="visually-hidden">{t('journey.chaptersCount', { n: CHAPTER_COUNT })}</span>

      {/* chapter rail: where you are in the journey */}
      <nav className="rail ui" aria-label={t('journey.railLabel')}>
        <ol>
          {CHAPTER_KEYS.map((k, i) => (
            <li key={k}>
              <button type="button" className={'rail__item' + (chapter === i ? ' is-current' : '')} aria-current={chapter === i ? 'step' : undefined} onClick={() => goTo(i)}>
                <span className="rail__n tnum">{String(i + 1).padStart(2, '0')}</span>
                <span className="rail__label">{t(`journey.${k}.kicker` as MessageKey)}</span>
              </button>
            </li>
          ))}
        </ol>
        {live && ambienceAvailable() && (
          <button type="button" className="rail__sound" aria-pressed={sound} onClick={toggleSound} title={t('journey.soundNote')} aria-label={sound ? t('journey.soundOn') : t('journey.soundOff')}>
            <Icon name={sound ? 'sound' : 'mute'} />
          </button>
        )}
      </nav>

    </div>
  );
}
