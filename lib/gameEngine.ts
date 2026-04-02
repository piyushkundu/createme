import { collection, addDoc, getDocs, query, orderBy, limit, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface LeaderboardEntry {
  id?: string;
  name: string;
  time: number;
  date: string;
}

export const loginOrRegister = async (username: string, pin: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', username.toLowerCase());
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // User exists, verify PIN
      const userData = userSnap.data();
      if (userData.pin === pin) {
        return true; 
      } else {
        throw new Error('Incorrect PIN for this username.');
      }
    } else {
      // Username is available, register new user
      await setDoc(userRef, {
        username,
        pin,
        createdAt: new Date().toISOString()
      });
      return true;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Authentication failed');
  }
};

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

// --- ADMIN FUNCTIONS ---

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: any[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push({ id: docSnap.id, ...docSnap.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting users: ", error);
    return [];
  }
};

export const deleteUser = async (username: string) => {
  try {
    await deleteDoc(doc(db, 'users', username.toLowerCase()));
    return true;
  } catch (error) {
    console.error("Error deleting user: ", error);
    return false;
  }
};

export const deleteLeaderboardEntry = async (id: string, mode: string = 'states') => {
  try {
    const colName = mode === 'states' ? 'leaderboard' : `leaderboard_${mode}`;
    await deleteDoc(doc(db, colName, id));
    return true;
  } catch (error) {
    console.error("Error deleting leaderboard entry: ", error);
    return false;
  }
};
