import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const deleteAccount = onCall(
  { region: "asia-northeast1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "認証が必要です");
    }

    try {
      const batch = db.batch();

      // 1. ユーザーが所有するブランドを取得
      const membersSnap = await db
        .collection("brandMembers")
        .where("userId", "==", uid)
        .get();

      const ownedBrandIds: string[] = [];
      for (const memberDoc of membersSnap.docs) {
        const data = memberDoc.data();
        if (data.role === "OWNER") {
          ownedBrandIds.push(data.brandId);
        }
        batch.delete(memberDoc.ref);
      }

      // 2. 所有ブランドの関連データを削除
      for (const brandId of ownedBrandIds) {
        // ブランドドキュメント
        batch.delete(db.collection("brands").doc(brandId));

        // デザインシステム
        batch.delete(db.collection("designSystems").doc(brandId));

        // アセット
        const assetsSnap = await db
          .collection("assets")
          .where("brandId", "==", brandId)
          .get();
        assetsSnap.docs.forEach((d) => batch.delete(d.ref));

        // クリエイティブ
        const creativesSnap = await db
          .collection("creatives")
          .where("brandId", "==", brandId)
          .get();
        creativesSnap.docs.forEach((d) => batch.delete(d.ref));

        // 他メンバーのbrandMembers
        const otherMembersSnap = await db
          .collection("brandMembers")
          .where("brandId", "==", brandId)
          .get();
        otherMembersSnap.docs.forEach((d) => batch.delete(d.ref));
      }

      // 3. ユーザードキュメント削除
      batch.delete(db.collection("users").doc(uid));

      await batch.commit();

      // 4. Firebase Authのユーザー削除
      await admin.auth().deleteUser(uid);

      return { success: true };
    } catch (error: any) {
      console.error("Account deletion error:", error);
      throw new HttpsError("internal", "アカウント削除に失敗しました");
    }
  }
);
