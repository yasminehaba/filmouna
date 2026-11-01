
import { Component } from '@angular/core';
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
  IonHeader
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
    IonHeader
  ]
})
export class LoginPage {

  errorMessage = '';

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

    this.errorMessage = '';

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

      // Redirection
      if (currentUser?.role === 'admin') {

      await this.router.navigateByUrl('/admin');

    } else {

      await this.router.navigateByUrl('/home');

    }

    } catch (error: any) {

      console.error(error);

      switch (error.code) {

        case 'auth/invalid-credential':
          this.errorMessage = 'Email ou mot de passe incorrect.';
          break;

        case 'auth/invalid-email':
          this.errorMessage = 'Email invalide.';
          break;

        case 'auth/user-disabled':
          this.errorMessage = 'Ce compte est désactivé.';
          break;

        default:
          this.errorMessage = 'Erreur lors de la connexion.';
      }
    }
  }
}
