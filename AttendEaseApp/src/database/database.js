import { open } from 'react-native-quick-sqlite';

const db = open({
  name: 'attendease.db',
});

export const getDBConnection = () => {
  const timetableExists = isTableExists("timetable");
  const notificationsExists = isTableExists("notifications");

  if (!timetableExists || !notificationsExists) {
    createTables();
  }
  return db;
};

export const createTables = () => {

  const timetableQuery = `
    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY,

      branch_id TEXT NOT NULL,
      branch_name TEXT NOT NULL,

      year INTEGER NOT NULL,
      semester INTEGER NOT NULL,

      section TEXT NOT NULL,

      day TEXT NOT NULL,

      period_id INTEGER NOT NULL,

      subject_id TEXT NOT NULL,
      subject_name TEXT NOT NULL,

      room_number INTEGER,

      teacher_id TEXT,
      teacher_name TEXT,

      cancelled INTEGER DEFAULT 0,

      cancelled_from TEXT,
      cancelled_to TEXT,

      substitute_teacher_id TEXT,
      substitute_teacher_name TEXT,

      substituted_till TEXT,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const notificationTableQuery = `
  CREATE TABLE IF NOT EXISTS notifications 
    (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      notification_id TEXT NOT NULL UNIQUE,

      source TEXT NOT NULL,
      -- FCM / BLE

      type TEXT NOT NULL,

      title TEXT,
      body TEXT,

      is_read INTEGER DEFAULT 0,

      received_at INTEGER NOT NULL
  );`

  try {
    db.execute(timetableQuery);
    db.execute(notificationTableQuery);
    console.log('Tables created');
  } catch (error) {
    console.log('Database Error:', error);
  }

};

export const isTableExists = (
  tableName
) => {
  try {
    const result = db.execute(
      `
      SELECT name
      FROM sqlite_master
      WHERE type='table'
      AND name=?
      `,
      [tableName]
    );
    return result.rows._array.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export function saveNotification(database, notification) {
  try {
    const result = database.execute(
      `
      INSERT OR IGNORE INTO notifications (
        notification_id,
        source,
        type,
        title,
        body,
        is_read,
        received_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        notification.notification_id,
        notification.source,
        notification.type,
        notification.title || null,
        notification.body || null,
        0,
        Date.now(),
      ]
    );

    return result;
  } catch (error) {
    console.log(
      'Insert notification error:',
      error
    );

    throw error;
  }
}