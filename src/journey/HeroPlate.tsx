// Chapters 1–2: the forest plate (image A) as a living 2.5D photograph. The near-frame layers part and pass the
// camera as the visitor scrolls, the base pushes in toward the volcano, mist thins, clouds crawl across the summit.
// All motion is driven by the --p1/--p2/--px/--py custom properties the driver writes (see journey.css).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlateBox, PlateImage, PlateLayer } from './Plate';
import { Morpho } from './Morpho';
import { useT } from '../i18n';

const MIST = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'plates/';

export function HeroPlate({ live }: { live: boolean }) {
  const { t } = useT();
  const [lift, setLift] = useState<'left' | 'right' | null>(null);
  return (
    <div className="stage__hero">
      <PlateBox plate="forest" className="plate--forest">
        <PlateImage plate="forest" layer="base" className="plate__base" priority />
        {live && (
          <>
            <div className="plate__shafts" />
            <div className="plate__mist plate__mist--1" style={{ backgroundImage: `url(${MIST}mist-1.png)` }} />
            <div className="plate__clouds" style={{ backgroundImage: `url(${MIST}mist-2.png)` }} />
          </>
        )}
        <PlateLayer plate="forest" layer="near-left" className={'plate__near plate__near--left' + (lift === 'left' ? ' is-lifted' : '')} priority />
        <PlateLayer plate="forest" layer="near-right" className={'plate__near plate__near--right' + (lift === 'right' ? ' is-lifted' : '')} priority />
        {live && <div className="plate__mist plate__mist--2" style={{ backgroundImage: `url(${MIST}mist-2.png)` }} />}
        {live && <Morpho className="morpho--hero" size={52} />}
        {/* the animals in the plate answer the pointer: a label, a small lift, a way into the journal */}
        <nav className="plate__hotspots" aria-label={t('journey.ch1.animals')}>
          <Link to="/wildlife?focus=keel-billed-toucan" className="hotspot hotspot--toucans" style={{ left: '7%', top: '9%', width: '18%', height: '28%' }} onPointerEnter={() => setLift('left')} onPointerLeave={() => setLift(null)} onFocus={() => setLift('left')} onBlur={() => setLift(null)}>
            <span className="hotspot__label"><b>{t('journey.ch1.toucans')}</b><i>Ramphastos sulfuratus</i></span>
          </Link>
          <Link to="/wildlife?focus=brown-throated-three-toed-sloth" className="hotspot hotspot--sloth" style={{ left: '76%', top: '12%', width: '20%', height: '46%' }} onPointerEnter={() => setLift('right')} onPointerLeave={() => setLift(null)} onFocus={() => setLift('right')} onBlur={() => setLift(null)}>
            <span className="hotspot__label hotspot__label--right"><b>{t('journey.ch1.sloth')}</b><i>Bradypus variegatus</i></span>
          </Link>
          <Link to="/wildlife?focus=scarlet-macaw" className="hotspot hotspot--macaws" style={{ left: '58%', top: '42%', width: '16%', height: '16%' }}>
            <span className="hotspot__label"><b>{t('journey.ch1.macaws')}</b><i>Ara macao</i></span>
          </Link>
        </nav>
      </PlateBox>
      <div className="stage__vignette stage__vignette--hero" />
    </div>
  );
}
