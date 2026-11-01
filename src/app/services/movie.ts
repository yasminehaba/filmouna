import { Service } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Film } from '../models/movie.model';

@Service()
export class Movie {
  async getAll(): Promise<Film[]> {
    const snap = await getDocs(collection(db, 'movies'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Film);
  }

  async getById(id: string): Promise<Film | null> {
    const snap = await getDoc(doc(db, 'movies', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Film) : null;
  }

  add(film: Film) {
    return addDoc(collection(db, 'movies'), film);
  }

  update(id: string, film: Partial<Film>) {
    return updateDoc(doc(db, 'movies', id), film);
  }

  delete(id: string) {
    return deleteDoc(doc(db, 'movies', id));
  }
}
