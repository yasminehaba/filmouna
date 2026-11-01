import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, heart, heartOutline, filmOutline, createOutline, trashOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { Movie } from '../../services/movie';
import { Favorite } from '../../services/favorite';
import { Film } from '../../models/movie.model';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss'],
  imports: [
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSpinner,
  ],
})
export class MoviesPage {
  private auth = inject(Auth);
  private movieService = inject(Movie);
  private favoriteService = inject(Favorite);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  isAdmin = signal(false);
  loading = signal(true);
  movies = signal<Film[]>([]);
  favoriteIds = signal<string[]>([]);
  search = signal('');

  // Liste filtrée, recalculée automatiquement quand la recherche ou les films changent
  filteredMovies = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.movies().filter((m) => m.title.toLowerCase().includes(q));
  });

  constructor() {
    addIcons({ add, heart, heartOutline, filmOutline, createOutline, trashOutline });
  }

  // Appelé à chaque affichage de l'onglet (rafraîchit la liste après un ajout/modification)
  async ionViewWillEnter() {
    this.loading.set(true);

    const user = await this.auth.getCurrentUser();
    this.isAdmin.set(user?.role === 'admin');

    this.movies.set(await this.movieService.getAll());

    if (!this.isAdmin()) {
      this.favoriteIds.set(await this.favoriteService.getIds());
    }

    this.loading.set(false);
  }

  isFavorite(id: string) {
    return this.favoriteIds().includes(id);
  }

  async toggleFavorite(film: Film, event: Event) {
    this.stop(event);

    const id = film.id!;
    if (this.isFavorite(id)) {
      await this.favoriteService.remove(id);
      this.favoriteIds.update((ids) => ids.filter((x) => x !== id));
    } else {
      await this.favoriteService.add(id);
      this.favoriteIds.update((ids) => [...ids, id]);
    }
  }

  addMovie() {
    this.router.navigateByUrl('/add-movie');
  }

  editMovie(film: Film, event: Event) {
    this.stop(event);
    this.router.navigateByUrl(`/add-movie/${film.id}`);
  }

  async deleteMovie(film: Film, event: Event) {
    this.stop(event);

    const alert = await this.alertCtrl.create({
      header: 'Supprimer le film',
      message: `Voulez-vous vraiment supprimer "${film.title}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            await this.movieService.delete(film.id!);
            this.movies.update((list) => list.filter((m) => m.id !== film.id));
          },
        },
      ],
    });

    await alert.present();
  }

  // Empêche d'ouvrir la page détails quand on clique sur un bouton de l'item
  private stop(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }
}
