import { AppUser } from './user.model';

// Résultat de la comparaison avec un autre utilisateur
export interface MatchResult {
  user: AppUser;
  score: number;            // 0 à 100
  commonMovies: string[];   // titres
  commonGenres: string[];
  commonActors: string[];
}

// Profil de goûts construit à partir des films favoris
export interface TasteProfile {
  movies: Set<string>;      // ids
  genres: Set<string>;
  actors: Set<string>;
  directors: Set<string>;
  decades: Set<number>;     // 1990, 2000, 2010...
}
