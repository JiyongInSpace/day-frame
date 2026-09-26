import type { SQLiteDatabase } from 'expo-sqlite';

export type RecordStatus = 'recorded' | 'skipped';
export type RecordSource = 'quick' | 'custom' | 'continued' | 'skip';

export type ActivityRecord = {
  id: number;
  intervalStart: number;
  intervalEnd: number;
  respondedAt: number;
  updatedAt: number;
  activityKey: string | null;
  activityLabel: string | null;
  emoji: string | null;
  note: string | null;
  status: RecordStatus;
  source: RecordSource;
};

type ActivityRecordRow = {
  id: number;
  interval_start: number;
  interval_end: number;
  responded_at: number;
  updated_at: number | null;
  activity_key: string | null;
  activity_label: string | null;
  emoji: string | null;
  note: string | null;
  status: RecordStatus;
  source: RecordSource;
};

export type SaveRecordInput = Omit<ActivityRecord, 'id' | 'respondedAt' | 'updatedAt'>;

const DATABASE_VERSION = 3;

export async function migrateDatabase(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS activity_records (
        id INTEGER PRIMARY KEY NOT NULL,
        interval_start INTEGER NOT NULL UNIQUE,
        interval_end INTEGER NOT NULL,
        responded_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        activity_key TEXT,
        activity_label TEXT,
        emoji TEXT,
        note TEXT,
        status TEXT NOT NULL CHECK (status IN ('recorded', 'skipped')),
        source TEXT NOT NULL CHECK (source IN ('quick', 'custom', 'continued', 'skip'))
      );
      CREATE INDEX IF NOT EXISTS activity_records_interval_end
        ON activity_records(interval_end);
    `);
    currentVersion = 2;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      ALTER TABLE activity_records ADD COLUMN updated_at INTEGER;
      UPDATE activity_records SET updated_at = responded_at WHERE updated_at IS NULL;
    `);
    currentVersion = 2;
  }

  if (currentVersion < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    currentVersion = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

function mapRecord(row: ActivityRecordRow): ActivityRecord {
  return {
    id: row.id,
    intervalStart: row.interval_start,
    intervalEnd: row.interval_end,
    respondedAt: row.responded_at,
    updatedAt: row.updated_at ?? row.responded_at,
    activityKey: row.activity_key,
    activityLabel: row.activity_label,
    emoji: row.emoji,
    note: row.note,
    status: row.status,
    source: row.source,
  };
}

export async function listRecords(
  db: SQLiteDatabase,
  start: number,
  end: number,
) {
  const rows = await db.getAllAsync<ActivityRecordRow>(
    `SELECT * FROM activity_records
     WHERE interval_start >= ? AND interval_start < ?
     ORDER BY interval_start ASC`,
    start,
    end,
  );
  return rows.map(mapRecord);
}

export async function getLatestRecordedActivity(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<ActivityRecordRow>(
    `SELECT * FROM activity_records
     WHERE status = 'recorded'
     ORDER BY interval_start DESC
     LIMIT 1`,
  );
  return row ? mapRecord(row) : null;
}

export async function getRecordByIntervalStart(
  db: SQLiteDatabase,
  intervalStart: number,
) {
  const row = await db.getFirstAsync<ActivityRecordRow>(
    'SELECT * FROM activity_records WHERE interval_start = ?',
    intervalStart,
  );
  return row ? mapRecord(row) : null;
}

export async function saveRecord(db: SQLiteDatabase, input: SaveRecordInput) {
  await db.runAsync(
    `INSERT INTO activity_records (
      interval_start,
      interval_end,
      responded_at,
      updated_at,
      activity_key,
      activity_label,
      emoji,
      note,
      status,
      source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(interval_start) DO UPDATE SET
      interval_end = excluded.interval_end,
      updated_at = excluded.updated_at,
      activity_key = excluded.activity_key,
      activity_label = excluded.activity_label,
      emoji = excluded.emoji,
      note = excluded.note,
      status = excluded.status,
      source = excluded.source`,
    input.intervalStart,
    input.intervalEnd,
    Date.now(),
    Date.now(),
    input.activityKey,
    input.activityLabel,
    input.emoji,
    input.note,
    input.status,
    input.source,
  );
}

export async function deleteRecord(db: SQLiteDatabase, intervalStart: number) {
  await db.runAsync(
    'DELETE FROM activity_records WHERE interval_start = ?',
    intervalStart,
  );
}
