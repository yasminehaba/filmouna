
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
  IonSpinner
} from '@ionic/angular';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  filmOutline,
  mailOutline,
  arrowBackOutline,
  sendOutline
} from 'ionicons/icons';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonLabel,
    IonInput,
    IonItem,
    IonIcon,
    IonText,
    IonSpinner
  ]
})
export class ForgotPasswordPage {

  email = signal('');
  loading = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    addIcons({
      filmOutline,
      mailOutline,
      arrowBackOutline,
      sendOutline
    });
  }

  async submitHandler() {

    this.errorMessage.set('');
    this.successMessage.set('');

    const emailValue = this.email().trim();

    if (!emailValue) {
      this.errorMessage.set('Veuillez saisir votre adresse email.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      this.errorMessage.set('Veuillez saisir une adresse email valide.');
      return;
    }

    this.loading.set(true);

    try {

      await this.authService.forgotPassword(emailValue);

      this.successMessage.set(
        'Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.'
      );

    } catch (error: any) {

      console.error(error);

      switch (error.code) {

        case 'auth/invalid-email':
          this.errorMessage.set('Adresse email invalide.');
          break;

        case 'auth/user-not-found':
          this.errorMessage.set('Aucun compte associé à cette adresse email.');
          break;

        case 'auth/too-many-requests':
          this.errorMessage.set(
            'Trop de tentatives. Veuillez réessayer plus tard.'
          );
          break;

        default:
          this.errorMessage.set(
            'Erreur lors de l’envoi de l’email. Veuillez réessayer.'
          );
      }

    } finally {
      this.loading.set(false);
    }
  }

  async goToLogin() {
    await this.router.navigateByUrl('/login');
  }
}
