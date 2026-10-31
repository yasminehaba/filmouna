import { Service } from '@angular/core';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AppUser } from '../models/user.model';

@Service()
export class Auth {
  async getCurrentUser(): Promise<AppUser | null> {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) return null;

    const snap = await getDoc(doc(db, 'users', user.uid));
    return snap.exists() ? (snap.data() as AppUser) : null;
  }

  logout() {
    return signOut(auth);
  }
}