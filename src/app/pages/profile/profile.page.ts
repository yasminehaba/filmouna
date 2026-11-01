
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  NavController,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner
} from '@ionic/angular';

import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  calendarOutline,
  createOutline,
  lockClosedOutline,
  logOutOutline
} from 'ionicons/icons';

import { Auth } from '../../services/auth';
import { AppUser } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner
  ]
})
export class ProfilePage {

  user = signal<AppUser | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    addIcons({
      personOutline,
      mailOutline,
      calendarOutline,
      createOutline,
      lockClosedOutline,
      logOutOutline
    });
  }

  ionViewWillEnter() {
    this.loadProfile();
  }

  async loadProfile() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const currentUser = await this.authService.getCurrentUser();

      if (!currentUser) {
        await this.router.navigateByUrl('/login', {
          replaceUrl: true
        });
        return;
      }

      this.user.set(currentUser);

    } catch (error) {
      console.error(error);
      this.errorMessage.set('Impossible de charger votre profil.');
    } finally {
      this.loading.set(false);
    }
  }

  private navCtrl = inject(NavController);

  // Pages hors des tabs : détruites au retour, recréées à chaque ouverture
  async editProfile() {
    await this.navCtrl.navigateForward('/edit-profile');
  }

  async editPassword() {
    await this.navCtrl.navigateForward('/edit-pwd');
  }

  async logout() {
    try {
      await this.authService.logout();

      await this.router.navigate(['/login'], {
        replaceUrl: true
      });

    } catch (error) {
      console.error(error);
      this.errorMessage.set('Erreur lors de la déconnexion.');
    }
  }
}
