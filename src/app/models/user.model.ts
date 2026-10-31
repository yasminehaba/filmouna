export interface AppUser {
  uid: string;
  nom: string;
  prenom: string;
  age: number;
  photo: string;
  role: 'user' | 'admin';
  disabled: boolean;
}