
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonLabel,
  IonInput,
  IonItem,
  IonIcon,
  IonText,
  IonHeader,
  IonInputPasswordToggle,
  IonSpinner
} from '@ionic/angular';

import { Router, RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  filmOutline,
  mailOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { AppUser } from '../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonLabel,
    IonInput,
    IonItem,
    IonIcon,
    IonText,
    IonInputPasswordToggle,
    IonSpinner
]
})
export class LoginPage {

  errorMessage = signal('');
  loading = signal(false);

  constructor(
    private authService: Auth,
    private router: Router
  ) {

    addIcons({
      filmOutline,
      mailOutline,
      lockClosedOutline
    });

  }

  async submitHandler(data: any) {

    this.errorMessage.set('');
    this.loading.set(true);

    try {

      // Appel du service Firebase
      const result = await this.authService.login(
        data.email,
        data.password
      );

      console.log('Login successful!');
      console.log('UID:', result.user.uid);

      // Récupérer les informations depuis Firestore
      const currentUser = await this.authService.getCurrentUser();

      console.log('Current user:', currentUser);
      console.log('role:', currentUser?.role);

      // Compte désactivé par l'admin
      if (currentUser?.disabled) {
        await this.authService.logout();
        this.errorMessage.set('Votre compte est désactivé. Veuillez contacter l\'administrateur.');
        return;
      }

      // Redirection 
      await this.router.navigateByUrl('/tabs/movies', { replaceUrl: true });

    } catch (error: any) {

      console.error(error);

      switch (error.code) {

        case 'auth/invalid-credential':
          this.errorMessage.set('Email ou mot de passe incorrect.');
          break;

        case 'auth/invalid-email':
          this.errorMessage.set('Email invalide.');
          break;

        case 'auth/user-disabled':
          this.errorMessage.set('Ce compte est désactivé.');
          break;

        default:
          this.errorMessage.set('Erreur lors de la connexion.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
