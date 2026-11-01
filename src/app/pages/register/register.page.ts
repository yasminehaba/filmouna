
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActionSheetController,
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
} from '@ionic/angular';

import { Router, RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  filmOutline,
  mailOutline,
  lockClosedOutline,
  personCircleOutline,
  cameraOutline,
  camera,
  image
} from 'ionicons/icons';

import { Auth } from '../../services/auth';
import { Photo } from '../../services/photo';

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
    IonText,
    IonInputPasswordToggle,
    IonSpinner
  ]
})
export class RegisterPage {

  errorMessage = signal('');
  loading = signal(false);

  // Photo sélectionnée par l'utilisateur
  selectedPhoto: File | null = null;

  // Aperçu de la photo
  photoPreview = signal('');

  private actionSheet = inject(ActionSheetController);
  private photoSer = inject(Photo);

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    addIcons({
      filmOutline,
      mailOutline,
      lockClosedOutline,
      personCircleOutline,
      cameraOutline,
      camera,
      image
    });
  }

  // Demander : caméra ou galerie ?
  async presentActionSheet() {
    const actionSheet = await this.actionSheet.create({
      header: 'Photo de profil',
      buttons: [
        {
          text: 'Prendre une photo',
          icon: 'camera',
          handler: async () => {
            try {
              const photo = await this.photoSer.prendrePhoto();
              this.setPhoto(await this.photoSer.toFile(photo));
            } catch {
              // L'utilisateur a annulé
            }
          },
        },
        {
          text: 'Choisir depuis la galerie',
          icon: 'image',
          handler: async () => {
            try {
              const photos = await this.photoSer.choisirPhotos();
              if (photos[0]) {
                this.setPhoto(await this.photoSer.toFile(photos[0]));
              }
            } catch {
              // L'utilisateur a annulé
            }
          },
        },
        { text: 'Annuler', role: 'cancel' },
      ],
    });

    await actionSheet.present();
  }

  // Vérifier et afficher la photo choisie
  setPhoto(file: File) {

    // Vérifier le format
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select a valid image.');
      return;
    }

    // Vérifier la taille maximale : 5 MB
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('Image must be smaller than 5 MB.');
      return;
    }

    this.errorMessage.set('');
    this.selectedPhoto = file;

    // Afficher l'aperçu
    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreview.set(reader.result as string);
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

    this.errorMessage.set('');

    if (this.loading()) return;

    this.loading.set(true);

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
      await this.router.navigateByUrl('/tabs/movies', { replaceUrl: true });

    } catch (error: any) {

      console.error('Register error:', error);

      switch (error.code) {

        case 'auth/email-already-in-use':
          this.errorMessage.set('This email is already registered.');
          break;

        case 'auth/invalid-email':
          this.errorMessage.set('Invalid email address.');
          break;

        case 'auth/weak-password':
          this.errorMessage.set('Password must contain at least 6 characters.');
          break;

        case 'permission-denied':
        case 'firestore/permission-denied':
          this.errorMessage.set('Firestore access denied. Check your security rules.');
          break;

        default:
          this.errorMessage.set(
            error.message || 'An error occurred during registration.'
          );
      }

    } finally {

      this.loading.set(false);

    }
  }
}
