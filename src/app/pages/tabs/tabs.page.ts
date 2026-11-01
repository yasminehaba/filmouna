import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  AlertController,
  NavController,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { addIcons } from 'ionicons';
import { filmOutline, heartOutline, peopleOutline, personOutline, sparklesOutline } from 'ionicons/icons';
import { auth, db } from '../../firebase';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);

  isAdmin = signal(false);

  // Fonction qui arrête l'écoute en temps réel
  private stopWatching?: Unsubscribe;

  constructor() {
    addIcons({ filmOutline, heartOutline, peopleOutline, personOutline, sparklesOutline });
  }

  async ngOnInit() {
    const user = await this.auth.getCurrentUser();
    this.isAdmin.set(user?.role === 'admin');

    this.watchAccount();
  }

  ngOnDestroy() {
    this.stopWatching?.();
  }

  // Écoute users/{uid} en temps réel : dès que l'admin met disabled = true → déconnexion
  private watchAccount() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    this.stopWatching = onSnapshot(
      doc(db, 'users', uid),
      async (snap) => {
        if (snap.data()?.['disabled'] === true) {
          this.stopWatching?.();
          await this.auth.logout();
          this.navCtrl.navigateRoot('/login');

          const alert = await this.alertCtrl.create({
            header: 'Compte désactivé',
            message: 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.',
            buttons: ['OK'],
          });
          await alert.present();
        }
      },
      () => {}, // ignore l'erreur qui arrive après une déconnexion normale
    );
  }
}
