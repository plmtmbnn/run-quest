// src/lib/firebaseService.ts
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { StoredPlayer } from "@/storage/types";
import { db } from "./firebase";

export interface GlobalStatsData {
  runners_created: number;
  races_registered: number;
  last_updated: string;
}

/**
 * Fetch overall all-time global community stats dynamically from Firebase.
 * Queries Firestore stats document or counts live documents from collections.
 */
export async function getGlobalStats(): Promise<GlobalStatsData> {
  const defaultNow = new Date().toISOString();

  if (!db) {
    console.log("[Firebase] getGlobalStats skipped: db is null");
    return {
      runners_created: 0,
      races_registered: 0,
      last_updated: defaultNow,
    };
  }

  try {
    console.log("[Firebase] Fetching global community stats...");
    const statsRef = doc(db, "stats", "global");
    const snap = await getDoc(statsRef);

    let runnersCreated = 0;
    let racesRegistered = 0;
    let lastUpdatedStr = defaultNow;

    if (snap.exists()) {
      const data = snap.data();
      if (data.last_updated?.toDate) {
        lastUpdatedStr = data.last_updated.toDate().toISOString();
      } else if (typeof data.last_updated === "string") {
        lastUpdatedStr = data.last_updated;
      }

      runnersCreated =
        typeof data.runners_created === "number" ? data.runners_created : 0;
      racesRegistered =
        typeof data.races_registered === "number" ? data.races_registered : 0;
    }

    // Fallback: If either metric is 0 or doc missing, query actual collection document count
    if (runnersCreated === 0 || racesRegistered === 0) {
      try {
        const runnersSnap = await getCountFromServer(collection(db, "runners"));
        const racesSnap = await getCountFromServer(
          collection(db, "raceResults"),
        );
        if (runnersCreated === 0) runnersCreated = runnersSnap.data().count;
        if (racesRegistered === 0) racesRegistered = racesSnap.data().count;
      } catch (countErr) {
        console.warn("[Firebase] getCountFromServer error:", countErr);
      }
    }

    console.log("[Firebase] Global community stats fetched successfully:", {
      runners_created: runnersCreated,
      races_registered: racesRegistered,
      last_updated: lastUpdatedStr,
    });

    return {
      runners_created: runnersCreated,
      races_registered: racesRegistered,
      last_updated: lastUpdatedStr,
    };
  } catch (e) {
    console.error("[Firebase] getGlobalStats error:", e);
  }

  return {
    runners_created: 0,
    races_registered: 0,
    last_updated: defaultNow,
  };
}

/**
 * Record a newly created player to Firestore and update global metrics.
 * Only anonymous, non-identifying fields are written — no id, name, or deviceId.
 */
export async function recordNewRunner(player: StoredPlayer) {
  if (!db) {
    console.log("[Firebase] recordNewRunner skipped: db is null");
    return;
  }
  try {
    console.log(
      "[Firebase] Upserting new runner document (nationality:",
      player.nationality ?? "default",
      ")",
    );
    const runnersCol = collection(db, "runners");
    const docRef = await addDoc(runnersCol, {
      nationality: player.nationality ?? null,
      createdAt: serverTimestamp(),
    });

    console.log(
      `[Firebase] New runner saved (Doc ID: ${docRef.id}). Updating stats/global.runners_created...`,
    );
    const statsRef = doc(db, "stats", "global");
    await setDoc(
      statsRef,
      {
        runners_created: increment(1),
        races_registered: increment(0),
        last_updated: serverTimestamp(),
      },
      { merge: true },
    );
    console.log(
      "[Firebase] Successfully incremented stats/global.runners_created!",
    );
  } catch (e) {
    console.error("[Firebase] recordNewRunner error:", e);
  }
}

/**
 * Record a finished race to Firestore and update global metrics.
 * No runnerId, deviceId, or resultId — fully anonymous.
 */
export async function recordRaceFinished(race: {
  distance: number;
  time: number;
  outcome: string;
}) {
  if (!db) {
    console.log("[Firebase] recordRaceFinished skipped: db is null");
    return;
  }
  try {
    console.log("[Firebase] Upserting race result document:", race);
    const resultsCol = collection(db, "raceResults");
    const docRef = await addDoc(resultsCol, {
      distance: race.distance,
      time: race.time,
      outcome: race.outcome,
      finishedAt: serverTimestamp(),
    });

    console.log(
      `[Firebase] Race result saved (Doc ID: ${docRef.id}). Updating stats/global.races_registered...`,
    );
    const statsRef = doc(db, "stats", "global");
    await setDoc(
      statsRef,
      {
        races_registered: increment(1),
        runners_created: increment(0),
        last_updated: serverTimestamp(),
      },
      { merge: true },
    );
    console.log(
      "[Firebase] Successfully incremented stats/global.races_registered!",
    );
  } catch (e) {
    console.error("[Firebase] recordRaceFinished error:", e);
  }
}
