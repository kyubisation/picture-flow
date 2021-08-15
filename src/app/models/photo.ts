export interface Photo {
  id?: string;
  description: string;
  created: number;
  url: string;
  resizedUrl?: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
}
