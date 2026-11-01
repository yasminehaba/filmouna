import { Component, computed, inject, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonToggle,
  IonBadge,
  IonIcon,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { peopleOutline, personCircleOutline } from 'ionicons/icons';
import { auth } from '../../firebase';
import { User } from '../../services/user';
import { AppUser } from '../../models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonToggle,
    IonBadge,
    IonIcon,
    IonSpinner,
  ],
})
export class AdminPage {
  private userService = inject(User);

  loading = signal(true);
  users = signal<AppUser[]>([]);
  search = signal('');

  // Recherche par nom, prénom ou email
  filteredUsers = computed(() => {
    const strSearch = this.search().toLowerCase().trim();
    return this.users().filter((u) =>
      `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(strSearch),
    );
  });

  constructor() {
    addIcons({ peopleOutline, personCircleOutline });
  }

  // Appelé à chaque affichage de l'onglet
  async ionViewWillEnter() {
    this.loading.set(true);

    try {
      // Tous les utilisateurs sauf l'admin connecté
      const users = await this.userService.getAll();
      this.users.set(users.filter((u) => u.uid !== auth.currentUser?.uid));
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleUser(user: AppUser, enabled: boolean) {
    const disabled = !enabled;

    // Mise à jour immédiate de l'écran
    this.setLocalDisabled(user.uid, disabled);

    try {
      await this.userService.setDisabled(user.uid, disabled);
    } catch (error) {
      console.error('Update user error:', error);
      // Échec : on remet l'ancien état
      this.setLocalDisabled(user.uid, !disabled);
    }
  }

  private setLocalDisabled(uid: string, disabled: boolean) {
    this.users.update((list) => list.map((u) => (u.uid === uid ? { ...u, disabled } : u)));
  }
}
