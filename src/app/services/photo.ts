import { Service } from '@angular/core';
import { Camera } from '@capacitor/camera';

@Service()
export class Photo {
  async prendrePhoto(): Promise<string> {
    const result = await Camera.takePhoto({ quality: 80 });
    return result.webPath!;
  }

  async choisirPhotos(): Promise<string[]> {
    const { results } = await Camera.chooseFromGallery({
      allowMultipleSelection: false,
    });
    return results.map((r) => r.webPath!).filter(Boolean);
  }

  async toFile(webPath: string): Promise<File> {
    const blob = await (await fetch(webPath)).blob();
    return new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
  }
}
