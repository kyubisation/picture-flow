export interface Photo {
  id?: string;
  description: string;
  tags: string[];
  created: number;
  url: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
}
