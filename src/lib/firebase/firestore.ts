import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Brand,
  BrandMember,
  Asset,
  DesignSystem,
  Creative,
  ContentFeedback,
  BrandRole,
} from "@/types";

function checkDbInit() {
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your environment variables.");
  }
  return db;
}

export async function createBrand(
  name: string,
  ownerId: string,
  description?: string
): Promise<string> {
  const brandRef = await addDoc(collection(checkDbInit(), "brands"), {
    name,
    description: description || "",
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(checkDbInit(), "brandMembers", `${brandRef.id}_${ownerId}`), {
    brandId: brandRef.id,
    userId: ownerId,
    role: "OWNER" as BrandRole,
    joinedAt: serverTimestamp(),
  });

  return brandRef.id;
}

export async function getBrand(brandId: string): Promise<Brand | null> {
  const brandDoc = await getDoc(doc(checkDbInit(), "brands", brandId));
  if (!brandDoc.exists()) return null;
  return { id: brandDoc.id, ...brandDoc.data() } as Brand;
}

export async function getUserBrands(userId: string): Promise<Brand[]> {
  const database = checkDbInit();

  // 1. ownerId で直接クエリ（セキュリティルール問題を回避）
  const ownedQuery = query(
    collection(database, "brands"),
    where("ownerId", "==", userId)
  );
  const ownedSnapshot = await getDocs(ownedQuery);
  const ownedBrands = ownedSnapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as Brand)
  );
  const ownedIds = new Set(ownedBrands.map((b) => b.id));

  // 2. brandMembers 経由で共有ブランドも取得
  let sharedBrands: Brand[] = [];
  try {
    const membersQuery = query(
      collection(database, "brandMembers"),
      where("userId", "==", userId)
    );
    const membersSnapshot = await getDocs(membersQuery);
    const sharedBrandIds = membersSnapshot.docs
      .map((d) => d.data().brandId)
      .filter((id): id is string => typeof id === "string" && !ownedIds.has(id));

    if (sharedBrandIds.length > 0) {
      const sharedDocs = await Promise.all(
        sharedBrandIds.map((id) => getDoc(doc(database, "brands", id)))
      );
      sharedBrands = sharedDocs
        .filter((d) => d.exists())
        .map((d) => ({ id: d.id, ...d.data() } as Brand));
    }
  } catch (err) {
    console.error("Failed to fetch shared brands:", err);
  }

  return [...ownedBrands, ...sharedBrands];
}

export async function updateBrand(
  brandId: string,
  data: Partial<Omit<Brand, "id" | "createdAt" | "ownerId">>
): Promise<void> {
  await updateDoc(doc(checkDbInit(), "brands", brandId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBrand(brandId: string): Promise<void> {
  await deleteDoc(doc(checkDbInit(), "brands", brandId));
}

export async function getBrandMembers(brandId: string): Promise<BrandMember[]> {
  const membersQuery = query(
    collection(checkDbInit(), "brandMembers"),
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
  const memberId = `${brandId}_${userId}`;
  await setDoc(doc(checkDbInit(), "brandMembers", memberId), {
    brandId,
    userId,
    role,
    joinedAt: serverTimestamp(),
  });
  return memberId;
}

export async function updateBrandMemberRole(
  memberId: string,
  role: BrandRole
): Promise<void> {
  await updateDoc(doc(checkDbInit(), "brandMembers", memberId), { role });
}

export async function removeBrandMember(memberId: string): Promise<void> {
  await deleteDoc(doc(checkDbInit(), "brandMembers", memberId));
}

export async function findUserByEmail(email: string): Promise<{ id: string; email: string; displayName: string | null } | null> {
  const usersQuery = query(
    collection(checkDbInit(), "users"),
    where("email", "==", email)
  );
  const snapshot = await getDocs(usersQuery);
  if (snapshot.empty) return null;
  const userDoc = snapshot.docs[0];
  const data = userDoc.data();
  return { id: userDoc.id, email: data.email, displayName: data.displayName };
}

export async function createAsset(
  brandId: string,
  fileName: string,
  fileType: string,
  storagePath: string,
  downloadUrl: string,
  uploadedBy: string,
  fileSize?: number
): Promise<string> {
  try {
    const assetRef = await addDoc(collection(checkDbInit(), "assets"), {
      brandId,
      fileName,
      fileType,
      fileSize: fileSize || 0,
      fileUrl: downloadUrl,
      storagePath,
      downloadUrl,
      uploadedBy,
      status: "processing",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return assetRef.id;
  } catch (error) {
    console.error("Firestore createAsset error:", error);
    throw error;
  }
}

export async function getAsset(assetId: string): Promise<Asset | null> {
  const assetDoc = await getDoc(doc(checkDbInit(), "assets", assetId));
  if (!assetDoc.exists()) return null;
  return { id: assetDoc.id, ...assetDoc.data() } as Asset;
}

export async function getBrandAssets(brandId: string): Promise<Asset[]> {
  try {
    const assetsQuery = query(
      collection(checkDbInit(), "assets"),
      where("brandId", "==", brandId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(assetsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Asset));
  } catch (error) {
    console.error("Firestore getBrandAssets error:", error);
    throw error;
  }
}

export function subscribeToBrandAssets(
  brandId: string,
  onUpdate: (assets: Asset[]) => void,
  onError?: (error: Error) => void
): () => void {
  const assetsQuery = query(
    collection(checkDbInit(), "assets"),
    where("brandId", "==", brandId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    assetsQuery,
    (snapshot) => {
      const assets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Asset));
      onUpdate(assets);
    },
    (error) => {
      console.error("Assets subscription error:", error);
      onError?.(error);
    }
  );
}

export async function updateAsset(
  assetId: string,
  data: Partial<Omit<Asset, "id" | "createdAt" | "brandId" | "uploadedBy">>
): Promise<void> {
  await updateDoc(doc(checkDbInit(), "assets", assetId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAsset(assetId: string): Promise<void> {
  await deleteDoc(doc(checkDbInit(), "assets", assetId));
}

export async function getDesignSystem(
  brandId: string
): Promise<DesignSystem | null> {
  const designDoc = await getDoc(doc(checkDbInit(), "designSystems", brandId));
  if (!designDoc.exists()) return null;
  return { brandId, ...designDoc.data() } as DesignSystem;
}

export async function updateDesignSystem(
  brandId: string,
  data: Partial<Omit<DesignSystem, "brandId">>
): Promise<void> {
  const docRef = doc(checkDbInit(), "designSystems", brandId);
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
  const creativeRef = await addDoc(collection(checkDbInit(), "creatives"), {
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
  const creativeDoc = await getDoc(doc(checkDbInit(), "creatives", creativeId));
  if (!creativeDoc.exists()) return null;
  return { id: creativeDoc.id, ...creativeDoc.data() } as Creative;
}

export async function getBrandCreatives(brandId: string): Promise<Creative[]> {
  const creativesQuery = query(
    collection(checkDbInit(), "creatives"),
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
  await updateDoc(doc(checkDbInit(), "creatives", creativeId), data);
}

export async function deleteCreative(creativeId: string): Promise<void> {
  await deleteDoc(doc(checkDbInit(), "creatives", creativeId));
}

export async function addContentFeedback(
  creativeId: string,
  feedback: Omit<ContentFeedback, "id" | "createdAt">
): Promise<void> {
  const creative = await getCreative(creativeId);
  if (!creative) throw new Error("Creative not found");

  const newFeedback: ContentFeedback = {
    ...feedback,
    id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Timestamp.now(),
  };

  const feedbacks = creative.feedbacks || [];
  feedbacks.push(newFeedback);

  await updateDoc(doc(checkDbInit(), "creatives", creativeId), {
    feedbacks,
    updatedAt: serverTimestamp(),
  });
}

export async function removeContentFeedback(
  creativeId: string,
  feedbackId: string
): Promise<void> {
  const creative = await getCreative(creativeId);
  if (!creative) throw new Error("Creative not found");

  const feedbacks = (creative.feedbacks || []).filter((fb) => fb.id !== feedbackId);

  await updateDoc(doc(checkDbInit(), "creatives", creativeId), {
    feedbacks,
    updatedAt: serverTimestamp(),
  });
}

export async function updateContentFeedback(
  creativeId: string,
  feedbackId: string,
  updates: Partial<Pick<ContentFeedback, "flag" | "note">>
): Promise<void> {
  const creative = await getCreative(creativeId);
  if (!creative) throw new Error("Creative not found");

  const feedbacks = (creative.feedbacks || []).map((fb) =>
    fb.id === feedbackId ? { ...fb, ...updates } : fb
  );

  await updateDoc(doc(checkDbInit(), "creatives", creativeId), {
    feedbacks,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllUserAssets(brandIds: string[]): Promise<Asset[]> {
  if (brandIds.length === 0) return [];
  
  const allAssets: Asset[] = [];
  const chunks = [];
  for (let i = 0; i < brandIds.length; i += 10) {
    chunks.push(brandIds.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const assetsQuery = query(
      collection(checkDbInit(), "assets"),
      where("brandId", "in", chunk)
    );
    const snapshot = await getDocs(assetsQuery);
    snapshot.docs.forEach((doc) => {
      allAssets.push({ id: doc.id, ...doc.data() } as Asset);
    });
  }

  return allAssets;
}

export async function getAllUserCreatives(brandIds: string[]): Promise<Creative[]> {
  if (brandIds.length === 0) return [];
  
  const allCreatives: Creative[] = [];
  const chunks = [];
  for (let i = 0; i < brandIds.length; i += 10) {
    chunks.push(brandIds.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const creativesQuery = query(
      collection(checkDbInit(), "creatives"),
      where("brandId", "in", chunk)
    );
    const snapshot = await getDocs(creativesQuery);
    snapshot.docs.forEach((doc) => {
      allCreatives.push({ id: doc.id, ...doc.data() } as Creative);
    });
  }

  return allCreatives;
}

export async function getAllUserDesignSystems(brandIds: string[]): Promise<DesignSystem[]> {
  if (brandIds.length === 0) return [];
  
  const designSystems: DesignSystem[] = [];
  
  for (const brandId of brandIds) {
    const designDoc = await getDoc(doc(checkDbInit(), "designSystems", brandId));
    if (designDoc.exists()) {
      designSystems.push({ brandId, ...designDoc.data() } as DesignSystem);
    }
  }

  return designSystems;
}
