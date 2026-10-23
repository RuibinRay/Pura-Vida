import { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Shell } from './Shell';
import { HomePage } from './pages/HomePage';
import { ComingPage } from './pages/ComingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SECTIONS } from './sections';

const ExplorePage = lazy(() => import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const ProvincesPage = lazy(() => import('./pages/ProvincesPage').then((m) => ({ default: m.ProvincesPage })));
const ProvincePage = lazy(() => import('./pages/ProvincePage').then((m) => ({ default: m.ProvincePage })));
const WildlifePage = lazy(() => import('./pages/WildlifePage').then((m) => ({ default: m.WildlifePage })));
const MyCostaRicaPage = lazy(() => import('./pages/MyCostaRicaPage').then((m) => ({ default: m.MyCostaRicaPage })));
const SourcesPage = lazy(() => import('./pages/SourcesPage').then((m) => ({ default: m.SourcesPage })));

const fallback = <div className="page-loading container" aria-busy="true" />;
const wrap = (el: React.ReactNode) => <Suspense fallback={fallback}>{el}</Suspense>;

const router = createHashRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'explore', element: wrap(<ExplorePage />) },
      { path: 'provinces', element: wrap(<ProvincesPage />) },
      { path: 'provinces/:id', element: wrap(<ProvincePage />) },
      { path: 'wildlife', element: wrap(<WildlifePage />) },
      { path: 'my-costa-rica', element: wrap(<MyCostaRicaPage />) },
      { path: 'sources', element: wrap(<SourcesPage />) },
      ...SECTIONS.filter((s) => s.ready !== true).map((s) => ({ path: s.path.slice(1), element: <ComingPage section={s} /> })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
