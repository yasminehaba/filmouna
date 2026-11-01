import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash-screen/splash-screen.page').then((m) => m.SplashScreenPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'movie-details/:id',
    loadComponent: () => import('./pages/movie-details/movie-details.page').then((m) => m.MovieDetailsPage),
  },
  {
    // Ajouter un film
    path: 'add-movie',
    loadComponent: () => import('./pages/add-movie/add-movie.page').then((m) => m.AddMoviePage),
  },
  {
    // Modifier un film (même page, avec l'id)
    path: 'add-movie/:id',
    loadComponent: () => import('./pages/add-movie/add-movie.page').then((m) => m.AddMoviePage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'movies',
        loadComponent: () => import('./pages/movies/movies.page').then((m) => m.MoviesPage),
      },
      {
        path: 'favorites',
        loadComponent: () => import('./pages/favorites/favorites.page').then((m) => m.FavoritesPage),
      },
      {
        path: 'matching',
        loadComponent: () => import('./pages/matching/matching.page').then((m) => m.MatchingPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/admin.page').then((m) => m.AdminPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'edit-profile',
        loadComponent: () => import('./pages/edit-profile/edit-profile.page').then((m) => m.EditProfilePage),
      },
      {
        path: 'edit-pwd',
        loadComponent: () => import('./pages/edit-pwd/edit-pwd.page').then((m) => m.EditPwdPage),
      },
      {
        path: '',
        redirectTo: 'movies',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./pages/edit-profile/edit-profile.page').then((m) => m.EditProfilePage),
  },
  {
    path: 'edit-pwd',
    loadComponent: () => import('./pages/edit-pwd/edit-pwd.page').then((m) => m.EditPwdPage),
  },
];
