// Chapter 4: the illustrated beach-path plate (image B) as an interactive journal plate. Five animals carry
// hotspots; each opens the species entry with its sourced facts. The plate drifts slightly with the pointer and the
// near frame parts a little as the chapter begins; the animals lift on hover.
import { useState } from 'react';
import { Link } from '../ui/Link';
import { PlateBox, PlateImage, PlateLayer } from './Plate';
import { Sheet } from '../ui/Sheet';
import { SpeciesEntry } from '../ui/SpeciesEntry';
import { useT } from '../i18n';
import type { Species } from '../content/types';
import { usePassport } from '../state/passport';

export const PLATE_ANIMALS: { id: string; box: [number, number, number, number]; side: 'left' | 'right' | 'base' }[] = [
  { id: 'brown-throated-three-toed-sloth', box: [6, 34, 13, 24], side: 'left' },
  { id: 'white-faced-capuchin', box: [20, 19, 10, 16], side: 'left' },
  { id: 'scarlet-macaw', box: [76, 21, 12, 30], side: 'right' },
  { id: 'central-american-agouti', box: [25, 62, 12, 14], side: 'base' },
  { id: 'green-iguana', box: [59, 77, 19, 14], side: 'base' },
];

export function WildlifePlate({ species }: { species: Species[] }) {
  const { t, l } = useT();
  const [open, setOpen] = useState<Species | null>(null);
  const [lift, setLift] = useState<string | null>(null);
  const stamp = usePassport((s) => s.stamp);
  const byId = new Map(species.map((s) => [s.id, s]));
  const openSpecies = (id: string) => { const sp = byId.get(id); if (sp) { setOpen(sp); stamp('species', sp.id); } };
  const liftSide = PLATE_ANIMALS.find((a) => a.id === lift)?.side ?? null;
  return (
    <div className="stage__wild">
      <PlateBox plate="beach" className="plate--beach">
        <PlateImage plate="beach" layer="base" className="plate__base" />
        <PlateLayer plate="beach" layer="near-left" className={'plate__near plate__near--left' + (liftSide === 'left' ? ' is-lifted' : '')} />
        <PlateLayer plate="beach" layer="near-right" className={'plate__near plate__near--right' + (liftSide === 'right' ? ' is-lifted' : '')} />
        <div className="plate__hotspots plate__hotspots--wild" role="group" aria-label={t('journey.ch4.hotspots')}>
          {PLATE_ANIMALS.map((a, i) => {
            const sp = byId.get(a.id);
            if (!sp) return null;
            return (
              <button
                key={a.id}
                type="button"
                className={'hotspot hotspot--wild' + (lift === a.id ? ' is-on' : '')}
                style={{ left: `${a.box[0]}%`, top: `${a.box[1]}%`, width: `${a.box[2]}%`, height: `${a.box[3]}%`, ['--i' as string]: i }}
                onClick={() => openSpecies(a.id)}
                onPointerEnter={() => setLift(a.id)}
                onPointerLeave={() => setLift(null)}
                onFocus={() => setLift(a.id)}
                onBlur={() => setLift(null)}
              >
                <span className="hotspot__ring" aria-hidden="true" />
                <span className={'hotspot__label' + (a.box[0] > 55 ? ' hotspot__label--right' : '')}><b>{l(sp.commonNames)}</b><i>{sp.scientific}</i></span>
              </button>
            );
          })}
        </div>
      </PlateBox>
      <div className="stage__vignette stage__vignette--wild" />
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? l(open.commonNames) : ''}>
        {open && (
          <div className="sheet-entry">
            <SpeciesEntry sp={open} heading="h3" compact />
            <p className="ui"><Link to={'/wildlife?focus=' + open.id} className="btn btn--ghost btn--sm">{t('journey.ch4.openJournal')}</Link></p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
