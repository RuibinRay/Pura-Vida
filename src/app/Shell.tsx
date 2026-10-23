import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SECTIONS, READY_SECTIONS } from './sections';
import { useT, LANGS, type Lang } from '../i18n';
import { useSettings, type MotionPref, type QualityPref } from '../state/settings';
import { usePassport } from '../state/passport';
import { useTier, whyStatus } from '../perf/tier';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';
import { Stamp } from '../ui/Stamp';
import { PROVINCE_ORDER, PROVINCE_COLORS } from '../map/geo';
import { useMapData } from '../map/useMapData';

export function Shell() {
  const { t, lang } = useT();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [open, setOpen] = useState<'contents' | 'passport' | 'settings' | null>(null);
  const stamps = usePassport((s) => s.discoveries.filter((d) => d.kind === 'province').length);
  const mainRef = useRef<HTMLElement>(null);

  // route change: scroll top, move focus to main, set title
  useEffect(() => {
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const why = /[?&]why/.test(location.search) || /[?&]why/.test(window.location.search) || /[?&]why/.test(window.location.hash);

  return (
    <div className={'shell' + (isHome ? ' shell--home' : '')}>
      <a href="#main" className="skip-link ui">{t('nav.skip')}</a>
      <header className={'topbar ui' + (isHome ? ' on-dark topbar--overlay' : '')}>
        <Link to="/" className="wordmark" aria-label={t('site.title')}>
          <span className="wordmark__a">Costa Rica</span>
          <span className="wordmark__b">· Pura Vida</span>
        </Link>
        <div className="topbar__tools">
          <LangSwitch />
          <button type="button" className="chip" onClick={() => setOpen('passport')} aria-haspopup="dialog">
            <Icon name="stamp" /> <span>{t('nav.passport')}</span> <b className="tnum">{stamps}/7</b>
          </button>
          <button type="button" className="chip chip--icon" onClick={() => setOpen('settings')} aria-haspopup="dialog" aria-label={t('nav.settings')}>
            <Icon name="settings" />
          </button>
          <button type="button" className="chip chip--icon chip--menu" onClick={() => setOpen('contents')} aria-haspopup="dialog" aria-label={t('nav.openMenu')}>
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <nav className="tabs ui" aria-label={t('nav.label')}>
        <ul>
          {READY_SECTIONS.map((s) => (
            <li key={s.id}>
              <NavLink to={s.path} end={s.path === '/'} className={({ isActive }) => 'tab' + (isActive ? ' is-current' : '') + (s.ink === 'dark' ? ' tab--dark-ink' : '')} style={{ ['--tab' as string]: s.color }}>
                <span>{t(s.tabKey ?? s.labelKey)}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button type="button" className="tab tab--more" style={{ ['--tab' as string]: 'var(--volcanic)' }} onClick={() => setOpen('contents')} aria-haspopup="dialog">
              <span>{t('nav.tab.contents')}</span>
            </button>
          </li>
        </ul>
      </nav>

      <main id="main" ref={mainRef} tabIndex={-1} className="main" key={location.pathname}>
        <Outlet />
      </main>

      {!isHome && (
        <footer className="footer ui">
          <p className="muted">{t('site.title')} · <Link to="/sources">{t('nav.sources')}</Link></p>
        </footer>
      )}

      <Sheet open={open === 'contents'} onClose={() => setOpen(null)} title={t('nav.contents')}>
        <ContentsList onNavigate={() => setOpen(null)} />
      </Sheet>
      <Sheet open={open === 'passport'} onClose={() => setOpen(null)} title={t('passport.title')}>
        <PassportSheet />
      </Sheet>
      <Sheet open={open === 'settings'} onClose={() => setOpen(null)} title={t('settings.title')}>
        <SettingsSheet />
      </Sheet>
      {why && <WhyOverlay />}
    </div>
  );
}

function LangSwitch() {
  const { t } = useT();
  const lang = useSettings((s) => s.lang);
  const setLang = useSettings((s) => s.setLang);
  return (
    <div className="seg seg--lang" role="group" aria-label={t('settings.language')}>
      {LANGS.map((l) => (
        <button key={l.code} type="button" lang={l.code} className={'seg__btn' + (lang === l.code ? ' is-on' : '')} aria-pressed={lang === l.code} onClick={() => setLang(l.code as Lang)} title={l.label}>
          {l.short}
        </button>
      ))}
    </div>
  );
}

function ContentsList({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useT();
  return (
    <ol className="contents">
      {SECTIONS.map((s, i) => (
        <li key={s.id} style={{ ['--tab' as string]: s.color }}>
          <span className="contents__n tnum">{String(i + 1).padStart(2, '0')}</span>
          {s.ready === true ? (
            <Link to={s.path} onClick={onNavigate} className="contents__link">{t(s.labelKey)}</Link>
          ) : (
            <span className="contents__soon">{t(s.labelKey)} <small>{t('nav.inPreparation', { n: s.ready })}</small></span>
          )}
        </li>
      ))}
    </ol>
  );
}

function PassportSheet() {
  const { t, lang } = useT();
  const discoveries = usePassport((s) => s.discoveries);
  const clear = usePassport((s) => s.clear);
  const { data } = useMapData();
  const done = PROVINCE_ORDER.filter((id) => discoveries.some((d) => d.kind === 'province' && d.id === id));
  return (
    <div className="passport">
      <p>{t('passport.lede')}</p>
      <p className="eyebrow">{t('passport.progress', { done: done.length, total: 7 })}</p>
      <ul className="passport__grid">
        {PROVINCE_ORDER.map((id) => {
          const d = discoveries.find((x) => x.kind === 'province' && x.id === id);
          const geo = data?.provinces.find((p) => p.id === id);
          const name = geo ? (geo.name[lang] || geo.name.en) : id;
          return (
            <li key={id}>
              <Stamp label={name} date={d?.at} color={PROVINCE_COLORS[id]} stamped={!!d} />
              <Link to={'/provinces/' + id} className="passport__name">{name}</Link>
            </li>
          );
        })}
      </ul>
      {discoveries.length > 0 && <button type="button" className="btn btn--ghost btn--sm" onClick={clear}>{t('passport.clear')}</button>}
    </div>
  );
}

function SettingsSheet() {
  const { t } = useT();
  const s = useSettings();
  const tier = useTier((st) => st.tier);
  const reason = useTier((st) => st.reason);
  const motions: { v: MotionPref; k: 'settings.motionAuto' | 'settings.motionCalm' | 'settings.motionFull' }[] = [{ v: 'auto', k: 'settings.motionAuto' }, { v: 'calm', k: 'settings.motionCalm' }, { v: 'full', k: 'settings.motionFull' }];
  const qualities: { v: QualityPref; k: 'settings.qualityAuto' | 'settings.qualityFull' | 'settings.qualityLite' | 'settings.qualityStill' | 'settings.qualityText' }[] = [{ v: 'auto', k: 'settings.qualityAuto' }, { v: 'full', k: 'settings.qualityFull' }, { v: 'lite', k: 'settings.qualityLite' }, { v: 'still', k: 'settings.qualityStill' }, { v: 'text', k: 'settings.qualityText' }];
  return (
    <div className="settings">
      <fieldset>
        <legend>{t('settings.language')}</legend>
        <LangSwitch />
      </fieldset>
      <fieldset>
        <legend>{t('settings.motion')}</legend>
        <div className="seg">
          {motions.map((m) => (
            <button key={m.v} type="button" className={'seg__btn' + (s.motion === m.v ? ' is-on' : '')} aria-pressed={s.motion === m.v} onClick={() => s.setMotion(m.v)}>{t(m.k)}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>{t('settings.quality')}</legend>
        <div className="seg seg--wrap">
          {qualities.map((q) => (
            <button key={q.v} type="button" className={'seg__btn' + (s.quality === q.v ? ' is-on' : '')} aria-pressed={s.quality === q.v} onClick={() => s.setQuality(q.v)}>{t(q.k)}</button>
          ))}
        </div>
        <p className="muted"><small>{t('settings.qualityNote')} {t('settings.tier')}: <b>{tier}</b> ({reason}).</small></p>
      </fieldset>
      <fieldset>
        <legend>{t('home.replayIntro')}</legend>
        <Link to="/?replay=1" className="btn btn--ghost btn--sm" onClick={() => s.setIntroSeen(false)}>{t('settings.replay')}</Link>
      </fieldset>
      <p className="muted"><small>{t('settings.aboutText')}</small></p>
    </div>
  );
}

function WhyOverlay() {
  const [status, setStatus] = useState(whyStatus());
  useEffect(() => {
    const id = setInterval(() => setStatus(whyStatus()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <pre className="why on-dark" aria-label="diagnostics">
      {Object.entries(status).map(([k, v]) => `${k}: ${String(v)}`).join('\n')}
    </pre>
  );
}
