
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  heart,
  heartOutline,
  filmOutline
} from 'ionicons/icons';

import { Movie } from '../../services/movie';
import { Favorite } from '../../services/favorite';
import { Film } from '../../models/movie.model';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText
  ]
})
export class FavoritesPage {

  private movieService = inject(Movie);
  private favoriteService = inject(Favorite);
  private router = inject(Router);

  loading = signal(true);
  movies = signal<Film[]>([]);
  favoriteIds = signal<string[]>([]);
  errorMessage = signal('');

  // Liste calculée automatiquement selon les favoris de l'utilisateur
  favoriteMovies = computed(() => {
    const ids = new Set(this.favoriteIds());

    return this.movies().filter(
      film => film.id && ids.has(film.id)
    );
  });

  constructor() {
    addIcons({
      heart,
      heartOutline,
      filmOutline
    });
  }

  // Recharger les favoris à chaque ouverture de la page
  async ionViewWillEnter() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      // Récupérer les identifiants des favoris
      const ids = await this.favoriteService.getIds();
      this.favoriteIds.set(ids);

      // Récupérer tous les films
      const allMovies = await this.movieService.getAll();
      this.movies.set(allMovies);

    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      this.errorMessage.set('Impossible de charger vos favoris.');
    } finally {
      this.loading.set(false);
    }
  }

  isFavorite(id: string) {
    return this.favoriteIds().includes(id);
  }

  // Supprimer un film des favoris
  async toggleFavorite(film: Film, event: Event) {
    this.stop(event);

    const id = film.id;

    if (!id || !this.isFavorite(id)) return;

    try {
      // Suppression dans Firebase
      await this.favoriteService.remove(id);

      // Mise à jour locale : computed() actualise automatiquement la liste
      this.favoriteIds.update(ids =>
        ids.filter(favoriteId => favoriteId !== id)
      );

    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      this.errorMessage.set('Impossible de supprimer ce favori.');
    }
  }

  // Ouvrir les détails du film
  goToDetails(id: string) {
    this.router.navigateByUrl(`/movie-details/${id}`);
  }

  // Empêcher le clic sur le cœur d'ouvrir les détails du film
  private stop(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }
}
