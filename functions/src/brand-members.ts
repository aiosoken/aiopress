import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { verifyBrandMember } from "./utils";

const db = admin.firestore();

/**
 * ブランドメンバーを招待する
 * 
 * @param brandId - ブランドID
 * @param email - 招待するユーザーのメールアドレス
 * @param role - 付与するロール (OWNER | ADMIN | MEMBER)
 * 
 * @returns 招待されたメンバーの情報
 */
export const inviteBrandMember = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { brandId, email, role } = data;

    // パラメータバリデーション
    if (!brandId || !email || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandId, email, roleは必須です"
      );
    }

    // メールアドレス形式のバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "有効なメールアドレスを入力してください"
      );
    }

    // ロールのバリデーション
    const validRoles = ["OWNER", "ADMIN", "MEMBER"];
    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "roleはOWNER, ADMIN, MEMBERのいずれかである必要があります"
      );
    }

    // 招待者の権限チェック（OWNER または ADMIN のみ招待可能）
    const inviterMember = await verifyBrandMember(brandId, context.auth.uid);
    if (inviterMember.role !== "OWNER" && inviterMember.role !== "ADMIN") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "メンバーを招待する権限がありません"
      );
    }

    // OWNERロールの付与はOWNERのみ可能
    if (role === "OWNER" && inviterMember.role !== "OWNER") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "OWNERロールを付与する権限がありません"
      );
    }

    // 招待するユーザーを検索
    const usersQuery = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        "指定されたメールアドレスのユーザーが見つかりません"
      );
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // 既にメンバーかチェック
    const memberId = `${brandId}_${userId}`;
    const existingMember = await db
      .collection("brandMembers")
      .doc(memberId)
      .get();

    if (existingMember.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        "このユーザーは既にブランドメンバーです"
      );
    }

    // メンバーを追加
    const memberData = {
      brandId,
      userId,
      role,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("brandMembers").doc(memberId).set(memberData);

    return {
      id: memberId,
      ...memberData,
      user: {
        id: userId,
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
      },
    };
  });

/**
 * ブランドメンバーのロールを変更する
 * 
 * @param memberId - メンバーID (${brandId}_${userId})
 * @param role - 新しいロール (OWNER | ADMIN | MEMBER)
 * 
 * @returns 更新されたメンバーの情報
 */
export const updateBrandMemberRole = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { memberId, role } = data;

    // パラメータバリデーション
    if (!memberId || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "memberId, roleは必須です"
      );
    }

    // ロールのバリデーション
    const validRoles = ["OWNER", "ADMIN", "MEMBER"];
    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "roleはOWNER, ADMIN, MEMBERのいずれかである必要があります"
      );
    }

    // メンバー情報を取得
    const memberDoc = await db.collection("brandMembers").doc(memberId).get();
    if (!memberDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "指定されたメンバーが見つかりません"
      );
    }

    const memberData = memberDoc.data()!;
    const brandId = memberData.brandId;

    // 実行者の権限チェック（OWNER のみロール変更可能）
    const executorMember = await verifyBrandMember(brandId, context.auth.uid);
    if (executorMember.role !== "OWNER") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "メンバーのロールを変更する権限がありません"
      );
    }

    // 自分自身のロールは変更できない
    if (memberData.userId === context.auth.uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "自分自身のロールは変更できません"
      );
    }

    // ロールを更新
    await db.collection("brandMembers").doc(memberId).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      id: memberId,
      ...memberData,
      role,
    };
  });

/**
 * ブランドメンバーを削除する
 * 
 * @param memberId - メンバーID (${brandId}_${userId})
 * 
 * @returns 削除されたメンバーのID
 */
export const removeBrandMember = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { memberId } = data;

    // パラメータバリデーション
    if (!memberId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "memberIdは必須です"
      );
    }

    // メンバー情報を取得
    const memberDoc = await db.collection("brandMembers").doc(memberId).get();
    if (!memberDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "指定されたメンバーが見つかりません"
      );
    }

    const memberData = memberDoc.data()!;
    const brandId = memberData.brandId;

    // 実行者の権限チェック（OWNER または ADMIN のみ削除可能）
    const executorMember = await verifyBrandMember(brandId, context.auth.uid);
    if (executorMember.role !== "OWNER" && executorMember.role !== "ADMIN") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "メンバーを削除する権限がありません"
      );
    }

    // OWNERは削除できない
    if (memberData.role === "OWNER") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "OWNERロールのメンバーは削除できません"
      );
    }

    // ADMINの削除はOWNERのみ可能
    if (memberData.role === "ADMIN" && executorMember.role !== "OWNER") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "ADMINロールのメンバーを削除する権限がありません"
      );
    }

    // メンバーを削除
    await db.collection("brandMembers").doc(memberId).delete();

    return {
      id: memberId,
      deleted: true,
    };
  });

/**
 * ブランドメンバー一覧を取得する（ユーザー情報付き）
 * 
 * @param brandId - ブランドID
 * 
 * @returns メンバー一覧（ユーザー情報を含む）
 */
export const getBrandMembersWithUsers = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { brandId } = data;

    // パラメータバリデーション
    if (!brandId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandIdは必須です"
      );
    }

    // アクセス権限チェック
    await verifyBrandMember(brandId, context.auth.uid);

    // メンバー一覧を取得
    const membersSnapshot = await db
      .collection("brandMembers")
      .where("brandId", "==", brandId)
      .get();

    // ユーザー情報を取得して結合（個別の失敗がリスト全体に影響しないようPromise.allSettledを使用）
    const results = await Promise.allSettled(
      membersSnapshot.docs.map(async (doc) => {
        const memberData = doc.data();
        const userDoc = await db.collection("users").doc(memberData.userId).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        return {
          id: doc.id,
          ...memberData,
          user: userData
            ? {
                id: userDoc.id,
                email: userData.email,
                displayName: userData.displayName || null,
                photoURL: userData.photoURL || null,
              }
            : null,
        };
      })
    );

    const members = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => r.value);

    return members;
  });
