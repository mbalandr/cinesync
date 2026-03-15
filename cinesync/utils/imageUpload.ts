import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export async function deleteImageFromFirebase(imageUrl: string) {
  try {
    // Extract the path from the Firebase Storage URL
    const storage = getStorage();
    
    // Convert URL to storage path
    // URL format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?token...
    const urlPath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
    const imageRef = ref(storage, urlPath);
    
    await deleteObject(imageRef);
    console.log("Successfully deleted old image");
  } catch (error) {
    console.error("Error deleting old image:", error);
    // Don't throw error as this is not critical
  }
}

export async function uploadImageToFirebase(uri: string, folder: string): Promise<string> {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create unique filename using timestamp and random string
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
    
    // Get storage reference
    const storage = getStorage();
    const storageRef = ref(storage, filename);

    // Upload blob
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
} 