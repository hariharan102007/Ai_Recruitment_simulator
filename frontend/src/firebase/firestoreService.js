import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. User Profile Operations
export async function syncUserProfile(user) {
  if (!user || !user.uid) return null;
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);

    const userData = {
      id: user.uid,
      name: user.displayName || user.name || 'Candidate',
      email: user.email || '',
      targetRole: user.targetRole || 'Full Stack Developer',
      experienceLevel: user.experienceLevel || 'Mid-Level',
      updatedAt: new Date().toISOString(),
    };

    if (!existingSnap.exists()) {
      userData.createdAt = new Date().toISOString();
    }

    await setDoc(userRef, userData, { merge: true });
    return userData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Candidate Resume Operations
export async function saveResumeToCloud(userId, resumeData) {
  if (!userId) return null;
  const docId = `resume_${userId}`;
  const path = `resumes/${docId}`;
  try {
    const resumeRef = doc(db, 'resumes', docId);
    const payload = {
      id: docId,
      userId,
      targetRole: resumeData.targetRole || 'Full Stack Developer',
      domain: resumeData.domain || 'Full Stack Development',
      parsedText: resumeData.parsedText || '',
      atsScore: resumeData.atsScore || 75,
      atsReport: resumeData.atsReport || {},
      updatedAt: new Date().toISOString(),
      createdAt: resumeData.createdAt || new Date().toISOString(),
    };

    await setDoc(resumeRef, payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserResume(userId) {
  if (!userId) return null;
  const docId = `resume_${userId}`;
  const path = `resumes/${docId}`;
  try {
    const resumeRef = doc(db, 'resumes', docId);
    const snap = await getDoc(resumeRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// 3. Stage Assessment Score Operations
export async function recordAssessmentScore(userId, stageId, score, evaluation = null) {
  if (!userId) return null;
  const docId = `${userId}_${stageId}`;
  const path = `assessments/${docId}`;
  try {
    const assessRef = doc(db, 'assessments', docId);
    const payload = {
      id: docId,
      userId,
      stageId,
      score,
      evaluation: evaluation || {},
      createdAt: new Date().toISOString(),
    };

    await setDoc(assessRef, payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserAssessments(userId) {
  if (!userId) return [];
  const path = 'assessments';
  try {
    const q = query(collection(db, 'assessments'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => results.push(d.data()));
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
