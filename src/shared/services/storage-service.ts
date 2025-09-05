import { admin } from "../config/database";
import { v4 as uudv4 } from "uuid";
import { ValidationError } from "../utils/validation.utils";
import { HttpStatus } from "../http/protocols-enums";

export class StorageService {
  private storage = admin.storage();

  async uploadImage(buffer: Buffer, folder = "images/lotes", fileName?: string) {
    try {
      console.log("Uploading image, buffer size:", buffer.length);
      const uniqueFileName = fileName || `${uudv4()}.jpg`;
      const file = this.storage.bucket().file(`${folder}/${uniqueFileName}`);
      console.log("File path:", `${folder}/${uniqueFileName}`);
      await file.save(buffer, {
        contentType: "image/jpeg",
        resumable: false,
      });
      console.log("Image uploaded successfully");
      return file.publicUrl();
    } catch (err) {
      console.error("Storage error details:", err);
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
