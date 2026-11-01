
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
  IonSpinner,
  IonInputPasswordToggle
} from '@ionic/angular';

import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  lockClosedOutline,
  saveOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-edit-pwd',
  templateUrl: './edit-pwd.page.html',
  styleUrls: ['./edit-pwd.page.scss'],
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
    IonSpinner,
    IonInputPasswordToggle
  ]
})
export class EditPwdPage {

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    addIcons({
      lockClosedOutline,
      saveOutline,
      arrowBackOutline
    });
  }

  async changePassword() {
    this.errorMessage.set('');
    this.successMessage.set('');

    const current = this.currentPassword();
    const newPwd = this.newPassword();
    const confirm = this.confirmPassword();

    if (!current || !newPwd || !confirm) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    if (newPwd.length < 6) {
      this.errorMessage.set(
        'Le nouveau mot de passe doit contenir au moins 6 caractères.'
      );
      return;
    }

    if (newPwd !== confirm) {
      this.errorMessage.set(
        'Les deux mots de passe ne correspondent pas.'
      );
      return;
    }

    if (current === newPwd) {
      this.errorMessage.set(
        'Le nouveau mot de passe doit être différent de l’ancien.'
      );
      return;
    }

    this.saving.set(true);

    try {
      await this.authService.changePassword(current, newPwd);

      this.successMessage.set(
        'Votre mot de passe a été modifié avec succès.'
      );

      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');

      await this.router.navigateByUrl('/tabs/profile');

    } catch (error: any) {
      console.error(error);

      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          this.errorMessage.set('Votre mot de passe actuel est incorrect.');
          break;

        case 'auth/weak-password':
          this.errorMessage.set('Le nouveau mot de passe est trop faible.');
          break;

        case 'auth/requires-recent-login':
          this.errorMessage.set(
            'Veuillez vous reconnecter avant de modifier votre mot de passe.'
          );
          break;

        default:
          this.errorMessage.set(
            'Erreur lors de la modification du mot de passe.'
          );
      }

    } finally {
      this.saving.set(false);
    }
  }

  async goBack() {
    await this.router.navigateByUrl('/tabs/profile');
  }
}
