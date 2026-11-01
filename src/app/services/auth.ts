
import { Injectable } from '@angular/core';

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

import { auth, db } from '../firebase';
import { AppUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  // Register
  async register(
    email: string,
    password: string,
    userData: Omit<AppUser, 'uid' | 'photo' | 'email'>,
    photo: string
  ): Promise<AppUser> {

    // 1. Créer le compte dans Firebase Authentication
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = credential.user.uid;

    // 2. Préparer les informations utilisateur
    const newUser: AppUser = {
      uid,
      email,
      ...userData,
      photo
    };

    // 3. Enregistrer les informations dans Firestore
    await setDoc(
      doc(db, 'users', uid),
      newUser
    );

    return newUser;
  }

  // Login
  async login(email: string, password: string) {

    return await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  }

  // Récupérer l'utilisateur connecté
  async getCurrentUser(): Promise<AppUser | null> {

    await auth.authStateReady();

    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    const snap = await getDoc(
      doc(db, 'users', user.uid)
    );

    return snap.exists()
      ? snap.data() as AppUser
      : null;
  }

    // Update profile
  async updateUserProfile(
    uid: string,
    data: {
      nom: string;
      prenom: string;
      age: number;
      photo: string;
    }
  ) {

    await updateDoc(doc(db, 'users', uid), {
      nom: data.nom,
      prenom: data.prenom,
      age: data.age,
      photo: data.photo
    });
  }
 // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ) {

    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error('No authenticated user found.');
    }

    // Re-authenticate before changing the password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  }

  // Logout
  logout() {
    return signOut(auth);
  }
  async forgotPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
}