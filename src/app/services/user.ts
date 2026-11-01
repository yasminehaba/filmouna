import { Service } from '@angular/core';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AppUser } from '../models/user.model';

@Service()
export class User {
  async getAll(): Promise<AppUser[]> {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => d.data() as AppUser);
  }

  // Activer / désactiver un utilisateur (jamais de suppression)
  setDisabled(uid: string, disabled: boolean) {
    return updateDoc(doc(db, 'users', uid), { disabled });
  }
}
