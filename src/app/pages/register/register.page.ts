
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
  IonText
} from '@ionic/angular';

import { Router, RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  filmOutline,
  mailOutline,
  lockClosedOutline,
  personCircleOutline,
  cameraOutline
} from 'ionicons/icons';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
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
    IonText
  ]
})
export class RegisterPage {

  errorMessage = '';
  loading = false;

  // Photo sélectionnée par l'utilisateur
  selectedPhoto: File | null = null;

  // Aperçu de la photo
  photoPreview = '';

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    addIcons({
      filmOutline,
      mailOutline,
      lockClosedOutline,
      personCircleOutline,
      cameraOutline
    });
  }

  // Sélection de la photo de profil
  onPhotoSelected(event: Event) {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Vérifier le format
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image.';
      input.value = '';
      return;
    }

    // Vérifier la taille maximale : 5 MB
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image must be smaller than 5 MB.';
      input.value = '';
      return;
    }

    this.errorMessage = '';
    this.selectedPhoto = file;

    // Afficher l'aperçu
    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // Compresser la photo et la convertir en Base64
  async compressImage(file: File): Promise<string> {

    const imageUrl = URL.createObjectURL(file);

    try {
      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(
          new Error('Unable to load image.')
        );

        image.src = imageUrl;
      });

      // Dimensions maximales : 600 x 600
      const maxDimension = 600;

      const ratio = Math.min(
        1,
        maxDimension / Math.max(image.width, image.height)
      );

      const canvas = document.createElement('canvas');

      canvas.width = Math.round(image.width * ratio);
      canvas.height = Math.round(image.height * ratio);

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Unable to process image.');
      }

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Compression JPEG
      let quality = 0.8;

      let base64 = canvas.toDataURL('image/jpeg', quality);

      // Limiter la taille de la photo
      while (base64.length > 240000 && quality > 0.3) {

        quality -= 0.1;

        base64 = canvas.toDataURL('image/jpeg', quality);
      }

      if (base64.length > 240000) {
        throw new Error(
          'Image is too large after compression. Please choose another image.'
        );
      }

      return base64;

    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  // Inscription
  async submitHandler(data: any) {

    this.errorMessage = '';

    if (this.loading) return;

    this.loading = true;

    try {

      // Convertir la photo en Base64
      let photoBase64 = '';

      if (this.selectedPhoto) {
        photoBase64 = await this.compressImage(this.selectedPhoto);
      }

      // Informations utilisateur
      const userData = {
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        age: Number(data.age),
        role: 'user' as const,
        disabled: false
      };

      // Appeler le service Auth
      const newUser = await this.authService.register(
        data.email.trim(),
        data.password,
        userData,
        photoBase64
      );

      console.log('Registration successful!');
      console.log('New user:', newUser);

      // Redirection après inscription
      await this.router.navigateByUrl('/home');

    } catch (error: any) {

      console.error('Register error:', error);

      switch (error.code) {

        case 'auth/email-already-in-use':
          this.errorMessage = 'This email is already registered.';
          break;

        case 'auth/invalid-email':
          this.errorMessage = 'Invalid email address.';
          break;

        case 'auth/weak-password':
          this.errorMessage = 'Password must contain at least 6 characters.';
          break;

        case 'permission-denied':
        case 'firestore/permission-denied':
          this.errorMessage = 'Firestore access denied. Check your security rules.';
          break;

        default:
          this.errorMessage =
            error.message || 'An error occurred during registration.';
      }

    } finally {

      this.loading = false;

    }
  }
}
