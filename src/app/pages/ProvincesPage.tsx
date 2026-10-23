import { Link } from 'react-router-dom';
import { useT } from '../../i18n';
import { useContent } from '../../content';
import { useMapData } from '../../map/useMapData';
import { PROVINCE_COLORS, PROVINCE_ORDER } from '../../map/geo';
import { ProvinceSilhouette } from '../../ui/ProvinceSilhouette';
import { usePassport } from '../../state/passport';
import { Icon } from '../../ui/Icon';
import { usePageTitle } from '../usePageTitle';

export function ProvincesPage() {
  const { t, l, lang } = useT();
  usePageTitle(t('provinces.title'));
  const content = useContent();
  const { data } = useMapData();
  const has = usePassport((s) => s.has);
  return (
    <article className="page container">
      <header className="page__head">
        <p className="eyebrow">{t('nav.provinces')}</p>
        <h1>{t('provinces.title')}</h1>
        <p className="lede">{t('provinces.lede')}</p>
      </header>
      <ol className="chapters">
        {PROVINCE_ORDER.map((id, i) => {
          const p = content?.provinces.find((q) => q.id === id);
          const name = p ? l(p.name) : data ? l(data.provinces.find((q) => q.id === id)!.name) : id;
          const area = p?.keyFacts?.areaKm2?.value ?? data?.provinces.find((q) => q.id === id)?.areaKm2;
          return (
            <li key={id} className="chapter" style={{ ['--tab' as string]: PROVINCE_COLORS[id] }}>
              <Link to={'/provinces/' + id} className="chapter__link">
                <span className="chapter__n tnum">{t('provinces.chapter', { n: i + 1 })}</span>
                <ProvinceSilhouette data={data} id={id} size={72} />
                <span className="chapter__body">
                  <span className="chapter__name">{name}</span>
                  <span className="chapter__meta ui">
                    {p?.capital?.name && <span>{t('explore.capital')}: {p.capital.name}</span>}
                    {area && <span className="tnum">{Math.round(area).toLocaleString(lang)} {t('explore.km2')}</span>}
                    {has('province', id) && <span className="chapter__stamped"><Icon name="check" /> {t('provinces.stamped')}</span>}
                  </span>
                  {p && <span className="chapter__text">{l(p.overview)}</span>}
                </span>
                <Icon name="arrow" size={22} />
              </Link>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
