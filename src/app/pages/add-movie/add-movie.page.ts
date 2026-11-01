import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NavController,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
} from '@ionic/angular';
import { Movie } from '../../services/movie';
import { Film } from '../../models/movie.model';

// Liste fixe des catégories (évite les fautes de frappe, utile pour le matching)
export const CATEGORIES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'War',
  'Western',
];

@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.page.html',
  styleUrls: ['./add-movie.page.scss'],
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonText,
    IonSpinner,
  ],
})
export class AddMoviePage implements OnInit {
  private movieService = inject(Movie);
  private navCtrl = inject(NavController);

  // ":id" de la route add-movie/:id (vide = ajout, rempli = modification)
  id = input<string>();
  isEdit = computed(() => !!this.id());

  categories = CATEGORIES;

  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  // Données du formulaire (acteurs saisis séparés par des virgules)
  form = {
    title: '',
    director: '',
    actors: '',
    description: '',
    categories: [] as string[],
    year: null as number | null,
    duration: null as number | null,
    photo: '',
    trailer: '',
  };

  async ngOnInit() {
    if (!this.isEdit()) return;

    // Mode modification : charger le film existant
    this.loading.set(true);

    try {
      const film = await this.movieService.getById(this.id()!);

      if (!film) {
        this.errorMessage.set('Film introuvable.');
        return;
      }

      this.form = {
        title: film.title,
        director: film.director,
        actors: film.actors.join(', '),
        description: film.description,
        categories: film.categories,
        year: film.year,
        duration: film.duration,
        photo: film.photo,
        trailer: film.trailer,
      };
    } catch (error) {
      console.error('Load movie error:', error);
      this.errorMessage.set('Erreur lors du chargement du film.');
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    this.errorMessage.set('');

    const f = this.form;
    const actors = f.actors.split(',').map((a) => a.trim()).filter(Boolean);

    // Tous les champs sont obligatoires
    if (
      !f.title.trim() ||
      !f.director.trim() ||
      !f.year ||
      !f.duration ||
      f.categories.length === 0 ||
      actors.length === 0 ||
      !f.description.trim() ||
      !f.photo.trim() ||
      !f.trailer.trim()
    ) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    const film: Film = {
      title: f.title.trim(),
      director: f.director.trim(),
      actors,
      description: f.description.trim(),
      categories: f.categories,
      year: Number(f.year),
      duration: Number(f.duration),
      photo: f.photo.trim(),
      trailer: f.trailer.trim(),
    };

    this.saving.set(true);

    try {
      if (this.isEdit()) {
        await this.movieService.update(this.id()!, film);
      } else {
        await this.movieService.add(film);
      }

      // Retour à la liste (elle se recharge dans ionViewWillEnter)
      this.navCtrl.navigateBack('/tabs/movies');
    } catch (error) {
      console.error('Save movie error:', error);
      this.errorMessage.set('Erreur lors de l\'enregistrement du film.');
    } finally {
      this.saving.set(false);
    }
  }
}
