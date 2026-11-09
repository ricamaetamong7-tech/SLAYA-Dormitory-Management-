
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";
export type UserRole = "Boarder" | "Caretaker" | "Owner";

// REGISTER USER
export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  role: UserRole
) {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    throw {
      code: "auth/invalid-email",
      message: "Please enter a valid email address.",
    };
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName: fullName.trim(),
    email: normalizedEmail,
    role: role,
    createdAt: serverTimestamp(),
  });

  return user;
}

// LOGIN USER
export async function loginUser(
  email: string,
  password: string
) {
  const normalizedEmail = email.trim().toLowerCase();

  const userCredential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  const user = userCredential.user;

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error("User account information was not found.");
  }

  const userData = userDoc.data();
  const role = userData.role;

  if (
    role !== "Boarder" &&
    role !== "Caretaker" &&
    role !== "Dorm Owner"
  ) {
    await signOut(auth);
    throw new Error("Invalid account role.");
  }

  return {
    user,
    role: role as UserRole,
  };
}

// LOGOUT USER
export async function logoutUser() {
  await signOut(auth);
}
