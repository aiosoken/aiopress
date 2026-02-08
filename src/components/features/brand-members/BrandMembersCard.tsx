"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/providers";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, Mail, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import type { BrandRole } from "@/types";

interface BrandMember {
  id: string;
  brandId: string;
  userId: string;
  role: BrandRole;
  joinedAt: any;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  } | null;
}

interface BrandMembersCardProps {
  brandId: string;
}

const roleLabels: Record<BrandRole, string> = {
  OWNER: "オーナー",
  ADMIN: "管理者",
  MEMBER: "メンバー",
};

const roleColors: Record<BrandRole, string> = {
  OWNER: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEMBER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function BrandMembersCard({ brandId }: BrandMembersCardProps) {
  const { user } = useAuthContext();
  const [members, setMembers] = useState<BrandMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<BrandRole>("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<BrandRole | null>(null);

  const functions = getFunctions(undefined, "asia-northeast1");

  useEffect(() => {
    loadMembers();
  }, [brandId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const getBrandMembersWithUsers = httpsCallable<
        { brandId: string },
        BrandMember[]
      >(functions, "getBrandMembersWithUsers");

      const result = await getBrandMembersWithUsers({ brandId });
      setMembers(result.data);

      // 現在のユーザーのロールを取得
      const currentMember = result.data.find((m) => m.userId === user?.id);
      setCurrentUserRole(currentMember?.role || null);
    } catch (error: any) {
      console.error("Failed to load members:", error);
      toast.error("メンバー一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("メールアドレスを入力してください");
      return;
    }

    setInviting(true);
    try {
      const inviteBrandMember = httpsCallable<
        { brandId: string; email: string; role: BrandRole },
        BrandMember
      >(functions, "inviteBrandMember");

      await inviteBrandMember({
        brandId,
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      toast.success("メンバーを招待しました");
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
      loadMembers();
    } catch (error: any) {
      console.error("Failed to invite member:", error);
      const message = error.message || "メンバーの招待に失敗しました";
      toast.error(message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: BrandRole) => {
    try {
      const updateBrandMemberRole = httpsCallable<
        { memberId: string; role: BrandRole },
        any
      >(functions, "updateBrandMemberRole");

      await updateBrandMemberRole({ memberId, role: newRole });
      toast.success("ロールを変更しました");
      loadMembers();
    } catch (error: any) {
      console.error("Failed to update role:", error);
      const message = error.message || "ロールの変更に失敗しました";
      toast.error(message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const removeBrandMember = httpsCallable<{ memberId: string }, any>(
        functions,
        "removeBrandMember"
      );

      await removeBrandMember({ memberId });
      toast.success("メンバーを削除しました");
      loadMembers();
    } catch (error: any) {
      console.error("Failed to remove member:", error);
      const message = error.message || "メンバーの削除に失敗しました";
      toast.error(message);
    }
  };

  const canInvite = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const canChangeRole = currentUserRole === "OWNER";
  const canRemove = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">メンバー管理</CardTitle>
          <CardDescription>
            ブランドメンバーの招待と権限管理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">メンバー管理</CardTitle>
            <CardDescription>
              ブランドメンバーの招待と権限管理
            </CardDescription>
          </div>
          {canInvite && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  メンバーを招待
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>メンバーを招待</DialogTitle>
                  <DialogDescription>
                    招待するユーザーのメールアドレスとロールを指定してください
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">ロール</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(value) => setInviteRole(value as BrandRole)}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">メンバー</SelectItem>
                        <SelectItem value="ADMIN">管理者</SelectItem>
                        {currentUserRole === "OWNER" && (
                          <SelectItem value="OWNER">オーナー</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {inviteRole === "OWNER" && "すべての権限を持ちます"}
                      {inviteRole === "ADMIN" && "メンバーの招待と削除ができます"}
                      {inviteRole === "MEMBER" && "閲覧と編集ができます"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                    disabled={inviting}
                  >
                    キャンセル
                  </Button>
                  <Button onClick={handleInvite} disabled={inviting}>
                    {inviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        招待中...
                      </>
                    ) : (
                      "招待する"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              メンバーがいません
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={member.user?.photoURL || undefined}
                      alt={member.user?.displayName || member.user?.email || ""}
                    />
                    <AvatarFallback>
                      {member.user?.displayName?.[0]?.toUpperCase() ||
                        member.user?.email?.[0]?.toUpperCase() ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.user?.displayName || member.user?.email || "Unknown"}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {member.user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canChangeRole && member.userId !== user?.id ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value as BrandRole)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">メンバー</SelectItem>
                        <SelectItem value="ADMIN">管理者</SelectItem>
                        <SelectItem value="OWNER">オーナー</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={roleColors[member.role]}>
                      <Shield className="mr-1 h-3 w-3" />
                      {roleLabels[member.role]}
                    </Badge>
                  )}
                  {canRemove &&
                    member.role !== "OWNER" &&
                    member.userId !== user?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>メンバーを削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              {member.user?.displayName || member.user?.email}
                              をブランドメンバーから削除します。この操作は取り消すことができません。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              削除する
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
