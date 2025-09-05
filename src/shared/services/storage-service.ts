import { getStorage } from "firebase-admin/storage";
import { v4 as uudv4 } from "uuid";
import { ValidationError } from "../utils/validation.utils";
import { HttpStatus } from "../http/protocols-enums";

export class StorageService {
  private storage = getStorage();

  async uploadImage(buffer: Buffer, folder = "images/lotes", fileName?: string) {
    try {
      const uniqueFileName = fileName || `${uudv4()}.jpg`;
      const file = this.storage.bucket().file(`${folder}/${uniqueFileName}`);
      await file.save(buffer, {
        contentType: "image/jpeg",
        resumable: false,
      });
      return file.publicUrl();
    } catch (err) {
      throw new ValidationError("Error uploading image", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteImage(imageUrl: string) {
    try {
      const imageRef = this.storage.bucket().file(imageUrl);
      await imageRef.delete();
    } catch (error) {
      throw new ValidationError("Error deleting image", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
