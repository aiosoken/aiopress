import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * ブランドメンバーシップを確認する共通ヘルパー
 * ドキュメントID（${brandId}_${uid}）で検索し、見つからない場合は
 * brandId + userId フィールドでフォールバック検索する
 */
export async function verifyBrandMember(
  brandId: string,
  uid: string
): Promise<FirebaseFirestore.DocumentData> {
  // 1. ドキュメントIDで検索
  const memberDoc = await db
    .collection("brandMembers")
    .doc(`${brandId}_${uid}`)
    .get();

  if (memberDoc.exists) {
    return memberDoc.data()!;
  }

  // 2. フォールバック: フィールドで検索
  const querySnapshot = await db
    .collection("brandMembers")
    .where("brandId", "==", brandId)
    .where("userId", "==", uid)
    .limit(1)
    .get();

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }

  // 3. フォールバック: ブランドのオーナーか確認
  const brandDoc = await db.collection("brands").doc(brandId).get();
  if (brandDoc.exists && brandDoc.data()?.ownerId === uid) {
    // brandMembersドキュメントが欠落しているので自動修復
    console.warn(
      `[verifyBrandMember] Auto-repairing missing brandMembers doc for owner: brandId=${brandId}, uid=${uid}`
    );
    const memberData = {
      brandId,
      userId: uid,
      role: "OWNER",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db
      .collection("brandMembers")
      .doc(`${brandId}_${uid}`)
      .set(memberData);
    return memberData;
  }

  throw new functions.https.HttpsError(
    "permission-denied",
    "ブランドメンバーではありません"
  );
}
