import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "./config";

function checkStorageInit() {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Please check your environment variables.");
  }
  return storage;
}

export async function uploadFile(
  file: File,
  path: string
): Promise<{ storagePath: string; downloadUrl: string }> {
  try {
    const storageRef = ref(checkStorageInit(), path);
    console.log("Uploading file to:", path);
    await uploadBytes(storageRef, file);
    console.log("Upload complete, getting download URL");
    const downloadUrl = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadUrl);
    return { storagePath: path, downloadUrl };
  } catch (error) {
    console.error("Storage upload error:", error);
    throw error;
  }
}

export async function uploadAsset(
  brandId: string,
  assetId: string,
  file: File
): Promise<{ storagePath: string; downloadUrl: string }> {
  const extension = file.name.split(".").pop() || "";
  const path = `brands/${brandId}/assets/${assetId}.${extension}`;
  return uploadFile(file, path);
}

export async function uploadLogo(
  brandId: string,
  file: File
): Promise<{ storagePath: string; downloadUrl: string }> {
  const extension = file.name.split(".").pop() || "";
  const path = `brands/${brandId}/logos/logo.${extension}`;
  return uploadFile(file, path);
}

export async function uploadCreativeImage(
  brandId: string,
  creativeId: string,
  imageData: Blob
): Promise<{ storagePath: string; downloadUrl: string }> {
  const path = `brands/${brandId}/creatives/${creativeId}.png`;
  const storageRef = ref(checkStorageInit(), path);
  await uploadBytes(storageRef, imageData);
  const downloadUrl = await getDownloadURL(storageRef);
  return { storagePath: path, downloadUrl };
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(checkStorageInit(), path);
  await deleteObject(storageRef);
}

export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(checkStorageInit(), path);
  return getDownloadURL(storageRef);
}

export async function listBrandAssets(brandId: string): Promise<string[]> {
  const listRef = ref(checkStorageInit(), `brands/${brandId}/assets`);
  const result = await listAll(listRef);
  return result.items.map((item) => item.fullPath);
}
