export interface Film {
  id?: string;
  title: string;
  director: string;      // réalisateur
  actors: string[];
  description: string;
  categories: string[];
  year: number;
  duration: number;      // en minutes
  photo: string;
  trailer: string;       // URL YouTube
}
