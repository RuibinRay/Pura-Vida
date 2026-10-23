import { useEffect, useState } from 'react';
import { loadMapData, type MapData } from './geo';

export function useMapData(): { data: MapData | null; error: string | null } {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadMapData()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);
  return { data, error };
}
