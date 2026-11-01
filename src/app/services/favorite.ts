import { Service } from '@angular/core';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Les favoris sont stockés dans users/{uid}.favorites (liste d'ids de films)
@Service()
export class Favorite {
  private userDoc() {
    return doc(db, 'users', auth.currentUser!.uid);
  }

  async getIds(): Promise<string[]> {
    const snap = await getDoc(this.userDoc());
    return snap.data()?.['favorites'] ?? [];
  }

  add(movieId: string) {
    return updateDoc(this.userDoc(), { favorites: arrayUnion(movieId) });
  }

  remove(movieId: string) {
    return updateDoc(this.userDoc(), { favorites: arrayRemove(movieId) });
  }
}
