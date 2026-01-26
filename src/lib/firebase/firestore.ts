import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Brand,
  BrandMember,
  Asset,
  DesignSystem,
  Creative,
  BrandRole,
} from "@/types";

export async function createBrand(
  name: string,
  ownerId: string,
  description?: string
): Promise<string> {
  const brandRef = await addDoc(collection(db, "brands"), {
    name,
    description: description || "",
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "brandMembers"), {
    brandId: brandRef.id,
    userId: ownerId,
    role: "OWNER" as BrandRole,
    joinedAt: serverTimestamp(),
  });

  return brandRef.id;
}

export async function getBrand(brandId: string): Promise<Brand | null> {
  const brandDoc = await getDoc(doc(db, "brands", brandId));
  if (!brandDoc.exists()) return null;
  return { id: brandDoc.id, ...brandDoc.data() } as Brand;
}

export async function getUserBrands(userId: string): Promise<Brand[]> {
  const membersQuery = query(
    collection(db, "brandMembers"),
    where("userId", "==", userId)
  );
  const membersSnapshot = await getDocs(membersQuery);

  const brandIds = membersSnapshot.docs.map((doc) => doc.data().brandId);
  if (brandIds.length === 0) return [];

  const brands: Brand[] = [];
  for (const brandId of brandIds) {
    const brand = await getBrand(brandId);
    if (brand) brands.push(brand);
  }

  return brands;
}

export async function updateBrand(
  brandId: string,
  data: Partial<Omit<Brand, "id" | "createdAt" | "ownerId">>
): Promise<void> {
  await updateDoc(doc(db, "brands", brandId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBrand(brandId: string): Promise<void> {
  await deleteDoc(doc(db, "brands", brandId));
}

export async function getBrandMembers(brandId: string): Promise<BrandMember[]> {
  const membersQuery = query(
    collection(db, "brandMembers"),
    where("brandId", "==", brandId)
  );
  const snapshot = await getDocs(membersQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BrandMember));
}

export async function addBrandMember(
  brandId: string,
  userId: string,
  role: BrandRole
): Promise<string> {
  const memberRef = await addDoc(collection(db, "brandMembers"), {
    brandId,
    userId,
    role,
    joinedAt: serverTimestamp(),
  });
  return memberRef.id;
}

export async function createAsset(
  brandId: string,
  fileName: string,
  fileType: string,
  storagePath: string,
  downloadUrl: string,
  uploadedBy: string
): Promise<string> {
  const assetRef = await addDoc(collection(db, "assets"), {
    brandId,
    fileName,
    fileType,
    storagePath,
    downloadUrl,
    uploadedBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return assetRef.id;
}

export async function getAsset(assetId: string): Promise<Asset | null> {
  const assetDoc = await getDoc(doc(db, "assets", assetId));
  if (!assetDoc.exists()) return null;
  return { id: assetDoc.id, ...assetDoc.data() } as Asset;
}

export async function getBrandAssets(brandId: string): Promise<Asset[]> {
  const assetsQuery = query(
    collection(db, "assets"),
    where("brandId", "==", brandId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(assetsQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Asset));
}

export async function updateAsset(
  assetId: string,
  data: Partial<Omit<Asset, "id" | "createdAt" | "brandId" | "uploadedBy">>
): Promise<void> {
  await updateDoc(doc(db, "assets", assetId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAsset(assetId: string): Promise<void> {
  await deleteDoc(doc(db, "assets", assetId));
}

export async function getDesignSystem(
  brandId: string
): Promise<DesignSystem | null> {
  const designDoc = await getDoc(doc(db, "designSystems", brandId));
  if (!designDoc.exists()) return null;
  return { brandId, ...designDoc.data() } as DesignSystem;
}

export async function updateDesignSystem(
  brandId: string,
  data: Partial<Omit<DesignSystem, "brandId">>
): Promise<void> {
  const docRef = doc(db, "designSystems", brandId);
  const existingDoc = await getDoc(docRef);

  if (existingDoc.exists()) {
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function createCreative(
  brandId: string,
  type: Creative["type"],
  prompt: string,
  content: string,
  createdBy: string,
  metadata: Creative["metadata"],
  imageUrl?: string
): Promise<string> {
  const creativeRef = await addDoc(collection(db, "creatives"), {
    brandId,
    type,
    prompt,
    content,
    imageUrl: imageUrl || null,
    metadata,
    createdBy,
    status: "DRAFT",
    createdAt: serverTimestamp(),
  });
  return creativeRef.id;
}

export async function getCreative(creativeId: string): Promise<Creative | null> {
  const creativeDoc = await getDoc(doc(db, "creatives", creativeId));
  if (!creativeDoc.exists()) return null;
  return { id: creativeDoc.id, ...creativeDoc.data() } as Creative;
}

export async function getBrandCreatives(brandId: string): Promise<Creative[]> {
  const creativesQuery = query(
    collection(db, "creatives"),
    where("brandId", "==", brandId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(creativesQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Creative));
}

export async function updateCreative(
  creativeId: string,
  data: Partial<Omit<Creative, "id" | "createdAt" | "brandId" | "createdBy">>
): Promise<void> {
  await updateDoc(doc(db, "creatives", creativeId), data);
}

export async function deleteCreative(creativeId: string): Promise<void> {
  await deleteDoc(doc(db, "creatives", creativeId));
}
