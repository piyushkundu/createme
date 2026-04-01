import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

export interface LeaderboardEntry {
  id?: string;
  name: string;
  time: number;
  date: string;
}

export const saveResult = async (name: string, time: number, mode: string = 'states') => {
  try {
    // Keep 'leaderboard' for states for backwards compatibility, use new collections for others
    const colName = mode === 'states' ? 'leaderboard' : `leaderboard_${mode}`;
    const docRef = await addDoc(collection(db, colName), {
      name,
      time,
      date: new Date().toISOString(),
      mode
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
};

export const getLeaderboard = async (mode: string = 'states'): Promise<LeaderboardEntry[]> => {
  try {
    const colName = mode === 'states' ? 'leaderboard' : `leaderboard_${mode}`;
    const q = query(collection(db, colName), orderBy("time", "asc"), limit(30));
    const querySnapshot = await getDocs(q);
    const data: LeaderboardEntry[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as Omit<LeaderboardEntry, 'id'>) });
    });
    return data;
  } catch (error) {
    console.error("Error getting leaderboard: ", error);
    return [];
  }
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
