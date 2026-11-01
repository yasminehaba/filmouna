import { Component, OnInit, inject, signal } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { filmOutline, heartOutline, peopleOutline, personOutline, sparklesOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage implements OnInit {
  private auth = inject(Auth);

  isAdmin = signal(false);

  constructor() {
    addIcons({ filmOutline, heartOutline, peopleOutline, personOutline, sparklesOutline });
  }

  async ngOnInit() {
    const user = await this.auth.getCurrentUser();
    this.isAdmin.set(user?.role === 'admin');
  }
}
