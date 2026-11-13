// How the home page film was made, and who took the photographs some of its shots start from. Shown on the Sources
// page: the film itself carries no labels.
import { useT } from '../i18n';
import { FILM } from './shots';
import { PHOTO_CREDITS, FILM_SOURCES } from './photoCredits';

export function FilmNotes() {
  const { t } = useT();
  return (
    <div className="film-notes">
      <p className="prose">{t('film.notes.intro', { n: FILM.shots.length })}</p>
      <ul className="prose">
        <li>{t('film.notes.map')}</li>
        <li>{t('film.notes.generated')}</li>
        <li>{t('film.notes.scene')}</li>
        <li>{t('film.notes.photo')}</li>
      </ul>
      <h3 className="h-small">{t('film.notes.photos')}</h3>
      <ul className="sources">
        {PHOTO_CREDITS.map((c) => (
          <li key={c.key}>
            <a href={c.page} target="_blank" rel="noopener noreferrer">{c.title}</a>
            <span className="sources__meta"> — {c.author}, <a href={c.licenceUrl} target="_blank" rel="noopener noreferrer license">{c.licence}</a></span>
          </li>
        ))}
      </ul>
      <p className="muted"><small>{t('film.notes.facts')}</small></p>
      <ul className="sources">
        {FILM_SOURCES.map((src) => (
          <li key={src.url}><a href={src.url} target="_blank" rel="noopener noreferrer">{src.title}</a><span className="sources__meta"> — {src.publisher}</span></li>
        ))}
      </ul>
    </div>
  );
}
