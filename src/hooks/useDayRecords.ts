import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { listRecords, type ActivityRecord } from '@/db/records';
import { getDayBounds } from '@/utils/time';

export function useDayRecords(now = new Date()) {
  const db = useSQLiteContext();
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const bounds = getDayBounds(now);
  const startTime = bounds.start.getTime();
  const endTime = bounds.end.getTime();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await listRecords(db, startTime, endTime);
      setRecords(next);
    } finally {
      setLoading(false);
    }
  }, [db, endTime, startTime]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { records, loading, refresh, bounds };
}
