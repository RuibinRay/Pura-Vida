// The home page is the film: a flight over Costa Rica scrubbed frame by frame with the scroll (src/film). The
// illustrated walk that used to be here lives at /walk.
import { Film } from '../../film/Film';
import { usePageTitle } from '../usePageTitle';

export function HomePage() {
  usePageTitle();
  return <Film />;
}
