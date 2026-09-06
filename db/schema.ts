// The deployed database is created from drizzle/0000_cloud_accounts.sql.
// These names form the small schema contract used by the Worker API.
export const cloudAccountTables = {
  users: "users",
  sessions: "sessions",
  saves: "saves",
  authAttempts: "auth_attempts",
} as const;
