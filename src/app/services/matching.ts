import { Service, inject } from '@angular/core';
import { auth } from '../firebase';
import { Film } from '../models/movie.model';
import { AppUser } from '../models/user.model';
import { MatchResult, TasteProfile } from '../models/match.model';
import { Movie } from './movie';
import { User } from './user';

// Score minimum pour être affiché (le cahier des charges demande > 75 %)
// Pour tester, vous pouvez le baisser (ex : 0)
export const MIN_SCORE = 75;

// Poids de chaque critère (total = 1)
const WEIGHTS = {
  movies: 0.3,
  genres: 0.3,
  actors: 0.2,
  directors: 0.1,
  decades: 0.1,
};

@Service()
export class Matching {
  private movieService = inject(Movie);
  private userService = inject(User);

  // Retourne les utilisateurs qui ressemblent à l'utilisateur connecté (score > MIN_SCORE)
  async findMatches(): Promise<{ hasFavorites: boolean; matches: MatchResult[] }> {
    const [films, users] = await Promise.all([
      this.movieService.getAll(),
      this.userService.getAll(),
    ]);

    // Accès rapide à un film par son id
    const filmsById = new Map(films.map((f) => [f.id!, f]));

    const me = users.find((u) => u.uid === auth.currentUser?.uid);
    const myProfile = this.buildProfile(me?.favorites ?? [], filmsById);

    if (myProfile.movies.size === 0) {
      return { hasFavorites: false, matches: [] };
    }

    const matches = users
      // Pas soi-même, pas les admins, pas les comptes désactivés
      .filter((u) => u.uid !== me?.uid && u.role !== 'admin' && !u.disabled)
      .map((u) => this.compare(myProfile, u, filmsById))
      .filter((m): m is MatchResult => m !== null && m.score > MIN_SCORE)
      .sort((a, b) => b.score - a.score);

    return { hasFavorites: true, matches };
  }

  // Construit le profil de goûts à partir des ids des films favoris
  private buildProfile(favoriteIds: string[], filmsById: Map<string, Film>): TasteProfile {
    const profile: TasteProfile = {
      movies: new Set(),
      genres: new Set(),
      actors: new Set(),
      directors: new Set(),
      decades: new Set(),
    };

    for (const id of favoriteIds) {
      const film = filmsById.get(id);
      if (!film) continue; // film supprimé par l'admin

      profile.movies.add(id);
      film.categories.forEach((c) => profile.genres.add(c));
      film.actors.forEach((a) => profile.actors.add(a));
      profile.directors.add(film.director);
      profile.decades.add(Math.floor(film.year / 10) * 10); // 2014 → 2010
    }

    return profile;
  }

  // Compare mon profil avec celui d'un autre utilisateur
  private compare(mine: TasteProfile, other: AppUser, filmsById: Map<string, Film>): MatchResult | null {
    const theirs = this.buildProfile(other.favorites ?? [], filmsById);
    if (theirs.movies.size === 0) return null;

    const score =
      WEIGHTS.movies * jaccard(mine.movies, theirs.movies) +
      WEIGHTS.genres * jaccard(mine.genres, theirs.genres) +
      WEIGHTS.actors * jaccard(mine.actors, theirs.actors) +
      WEIGHTS.directors * jaccard(mine.directors, theirs.directors) +
      WEIGHTS.decades * jaccard(mine.decades, theirs.decades);

    return {
      user: other,
      score: Math.round(score * 100),
      commonMovies: intersection(mine.movies, theirs.movies).map((id) => filmsById.get(id)!.title),
      commonGenres: intersection(mine.genres, theirs.genres),
      commonActors: intersection(mine.actors, theirs.actors),
    };
  }
}

// Éléments présents dans les deux ensembles
function intersection<T>(a: Set<T>, b: Set<T>): T[] {
  return [...a].filter((x) => b.has(x));
}

// Similarité de Jaccard : éléments communs / éléments distincts au total (0 à 1)
function jaccard<T>(a: Set<T>, b: Set<T>): number {
  const all = new Set([...a, ...b]).size;
  return all === 0 ? 0 : intersection(a, b).length / all;
}
