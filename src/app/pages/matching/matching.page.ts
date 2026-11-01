import { Component, inject, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonProgressBar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personCircleOutline, heartOutline, sparklesOutline, filmOutline, pricetagOutline, peopleOutline } from 'ionicons/icons';
import { Matching, MIN_SCORE } from '../../services/matching';
import { MatchResult } from '../../models/match.model';

@Component({
  selector: 'app-matching',
  templateUrl: './matching.page.html',
  styleUrls: ['./matching.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonIcon,
    IonSpinner,
    IonProgressBar,
  ],
})
export class MatchingPage {
  private matchingService = inject(Matching);

  minScore = MIN_SCORE;

  loading = signal(true);
  hasFavorites = signal(true);
  matches = signal<MatchResult[]>([]);

  constructor() {
    addIcons({ personCircleOutline, heartOutline, sparklesOutline, filmOutline, pricetagOutline, peopleOutline });
  }

  // Recalculé à chaque ouverture de l'onglet (les favoris ont pu changer)
  async ionViewWillEnter() {
    this.loading.set(true);

    try {
      const result = await this.matchingService.findMatches();
      this.hasFavorites.set(result.hasFavorites);
      this.matches.set(result.matches);
    } catch (error) {
      console.error('Matching error:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
