
export interface AppUser {
  uid: string;
  nom: string;
  prenom: string;
  age: number;
  email: string;
  photo: string;
  role: 'user' | 'admin';
  disabled: boolean;
  favorites?: string[];   // ids des films favoris
}
