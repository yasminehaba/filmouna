import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  heart,
  heartOutline,
  createOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  filmOutline,
} from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { Movie } from '../../services/movie';
import { Favorite } from '../../services/favorite';
import { Film } from '../../models/movie.model';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonSpinner,
  ],
})
export class MovieDetailsPage implements OnInit {
  private auth = inject(Auth);
  private movieService = inject(Movie);
  private favoriteService = inject(Favorite);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  // ":id" de la route (movie-details/:id), rempli automatiquement par withComponentInputBinding
  id = input.required<string>();

  film = signal<Film | null>(null);
  loading = signal(true);
  isAdmin = signal(false);
  isFavorite = signal(false);

  // URL YouTube "embed" sécurisée pour l'iframe (null si le lien n'est pas une vidéo YouTube)
  trailerUrl = computed(() => {
    const videoId = this.youtubeId(this.film()?.trailer);
    return videoId
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          // controls=1 : play/pause, barre de temps, plein écran
          // rel=0 : pas de vidéos suggérées d'autres chaînes à la fin
          // iv_load_policy=3 : pas d'annotations / cartes
          // cc_load_policy=0 : pas de sous-titres forcés
          // disablekb=1 : pas de raccourcis clavier
          `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&rel=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=1`,
        )
      : null;
  });

  constructor() {
    addIcons({
      heart,
      heartOutline,
      createOutline,
      calendarOutline,
      timeOutline,
      personOutline,
      filmOutline,
    });
  }

  async ngOnInit() {
    try {
      const user = await this.auth.getCurrentUser();
      this.isAdmin.set(user?.role === 'admin');

      this.film.set(await this.movieService.getById(this.id()));

      if (!this.isAdmin()) {
        const ids = await this.favoriteService.getIds();
        this.isFavorite.set(ids.includes(this.id()));
      }
    } catch (error) {
      console.error('Load movie error:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleFavorite() {
    if (this.isFavorite()) {
      await this.favoriteService.remove(this.id());
      this.isFavorite.set(false);
    } else {
      await this.favoriteService.add(this.id());
      this.isFavorite.set(true);
    }
  }

  editMovie() {
    this.router.navigateByUrl(`/add-movie/${this.id()}`);
  }

  // Extrait l'id de la vidéo depuis youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID ou /shorts/ID
  private youtubeId(url?: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
  }
}
