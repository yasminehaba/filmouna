
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
  personOutline,
  mailOutline,
  cameraOutline,
  saveOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { Auth } from '../../services/auth';
import { AppUser } from '../../models/user.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
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
export class EditProfilePage {

  user = signal<AppUser | null>(null);

  loading = signal(false);
  saving = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  editData = signal({
    nom: '',
    prenom: '',
    age: 0
  });

  selectedPhoto = signal<File | null>(null);
  photoPreview = signal('');

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    addIcons({
      personOutline,
      mailOutline,
      cameraOutline,
      saveOutline,
      arrowBackOutline
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

      this.editData.set({
        nom: currentUser.nom,
        prenom: currentUser.prenom,
        age: currentUser.age
      });

      this.photoPreview.set(currentUser.photo || '');

    } catch (error) {
      console.error(error);
      this.errorMessage.set('Impossible de charger votre profil.');
    } finally {
      this.loading.set(false);
    }
  }

  updateNom(value: string | null | undefined) {
    this.editData.update(data => ({
      ...data,
      nom: value ?? ''
    }));
  }

  updatePrenom(value: string | null | undefined) {
    this.editData.update(data => ({
      ...data,
      prenom: value ?? ''
    }));
  }

  updateAge(value: string | number | null | undefined) {
    this.editData.update(data => ({
      ...data,
      age: Number(value) || 0
    }));
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.errorMessage.set('');

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Veuillez sélectionner une image.');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('La taille de l’image ne doit pas dépasser 5 MB.');
      input.value = '';
      return;
    }

    this.selectedPhoto.set(file);

    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreview.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async compressImage(file: File): Promise<string> {
    const imageUrl = URL.createObjectURL(file);

    try {
      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(
          new Error('Impossible de charger cette image.')
        );
        image.src = imageUrl;
      });

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
        throw new Error('Impossible de traiter cette image.');
      }

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      let quality = 0.8;
      let base64 = canvas.toDataURL('image/jpeg', quality);

      while (base64.length > 240000 && quality > 0.3) {
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }

      if (base64.length > 240000) {
        throw new Error('Image trop volumineuse. Choisissez une autre image.');
      }

      return base64;

    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  async saveProfile() {
    this.errorMessage.set('');
    this.successMessage.set('');

    const currentUser = this.user();
    const data = this.editData();

    if (!currentUser) {
      this.errorMessage.set('Utilisateur introuvable.');
      return;
    }

    if (!data.nom.trim() || !data.prenom.trim()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    if (!Number.isInteger(data.age) || data.age <= 0) {
      this.errorMessage.set('Veuillez saisir un âge valide.');
      return;
    }

    this.saving.set(true);

    try {
      let photo = currentUser.photo || '';

      if (this.selectedPhoto()) {
        photo = await this.compressImage(this.selectedPhoto()!);
      }

      await this.authService.updateUserProfile(
        currentUser.uid,
        {
          nom: data.nom.trim(),
          prenom: data.prenom.trim(),
          age: data.age,
          photo
        }
      );

      this.successMessage.set('Profil modifié avec succès.');

      await this.router.navigateByUrl('/tabs/profile');

    } catch (error: any) {
      console.error(error);

      this.errorMessage.set(
        error.message || 'Erreur lors de la modification du profil.'
      );

    } finally {
      this.saving.set(false);
    }
  }

  async goBack() {
    await this.router.navigateByUrl('/tabs/profile');
  }
}
