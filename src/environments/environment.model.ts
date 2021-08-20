export interface PictureFlowConfiguration {
  production: boolean;
  title: string;
  resize?: {
    directory: string;
    resolution: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
