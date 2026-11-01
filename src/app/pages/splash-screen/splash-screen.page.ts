import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
  imports: [IonContent, IonSpinner],
})
export class SplashScreenPage implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);

  async ngOnInit() {
    // Show the splash for at least 2 seconds
    const [user] = await Promise.all([
      this.auth.getCurrentUser(),
      new Promise((r) => setTimeout(r, 2000)),
    ]);

    if (!user) {
      this.go('/login');
    } else if (user.disabled) {
      await this.auth.logout();
      this.go('/login');
    } else {
      this.go('/tabs/movies');
    }
  }

  private go(url: string) {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }
}
