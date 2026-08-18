import { db } from "@/db";
import { profiles, settings, analytics } from "@/db/schema";
import { eq } from "drizzle-orm";

// Any "single row of site-wide config" table (profiles, settings, analytics)
// has a `singletonKey` text column with a UNIQUE constraint, defaulting to
// "default". Always reading/writing through that fixed key — instead of an
// unordered `.limit(1)` — guarantees every request talks to the exact same
// physical row, even under concurrent seeding/requests. This is what fixes
// the bug where admin edits (avatar, custom background, theme, nav labels,
// etc.) would appear to silently "not save": duplicate rows created by a
// startup seeding race meant reads and writes could hit different rows.
const KEY = "default";

export async function getSingletonProfile() {
  await db.insert(profiles).values({ singletonKey: KEY }).onConflictDoNothing({ target: profiles.singletonKey });
  const rows = await db.select().from(profiles).where(eq(profiles.singletonKey, KEY)).limit(1);
  return rows[0];
}

export async function updateSingletonProfile(values: Record<string, any>) {
  await getSingletonProfile(); // ensure the row exists first
  const updated = await db
    .update(profiles)
    .set(values)
    .where(eq(profiles.singletonKey, KEY))
    .returning();
  return updated[0];
}

export async function getSingletonSettings() {
  await db.insert(settings).values({ singletonKey: KEY }).onConflictDoNothing({ target: settings.singletonKey });
  const rows = await db.select().from(settings).where(eq(settings.singletonKey, KEY)).limit(1);
  return rows[0];
}

export async function updateSingletonSettings(values: Record<string, any>) {
  await getSingletonSettings(); // ensure the row exists first
  const updated = await db
    .update(settings)
    .set(values)
    .where(eq(settings.singletonKey, KEY))
    .returning();
  return updated[0];
}

export async function getSingletonAnalytics() {
  await db.insert(analytics).values({ singletonKey: KEY }).onConflictDoNothing({ target: analytics.singletonKey });
  const rows = await db.select().from(analytics).where(eq(analytics.singletonKey, KEY)).limit(1);
  return rows[0];
}

export async function updateSingletonAnalytics(values: Record<string, any>) {
  await getSingletonAnalytics();
  const updated = await db
    .update(analytics)
    .set(values)
    .where(eq(analytics.singletonKey, KEY))
    .returning();
  return updated[0];
}
