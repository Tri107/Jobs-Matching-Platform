"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlinePencil,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineCheckBadge,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { getCVs, uploadCV, deleteCV } from '@/features/profile/services/cvApi';
import type { CVItem } from '@/types/cv';
import {
  getAuthUserProfile,
  updateAuthUserProfile,
  type AuthUserProfile,
} from "@/features/auth/services/cognitoAuthService";

const MAX_CVS = 3;

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Không rõ dung lượng";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatUpdatedAt(value?: string): string {
  if (!value) return "Không rõ thời gian";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
  export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [name, setName] = useState("");
  const [cvList, setCvList] = useState<CVItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    window.setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const userProfile = await getAuthUserProfile();

        if (!isMounted) return;
        setProfile(userProfile);
        setName(userProfile.name);
      } catch {
        if (isMounted) {
          router.replace("/login");
        }
        return;
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setSaving(true);
    try {
      await updateAuthUserProfile({
        name: name.trim() || profile.email || "Tài khoản",
      });
      const nextProfile = await getAuthUserProfile();
      setProfile(nextProfile);
      setName(nextProfile.name);
      setIsEditing(false);
      showNotification("Đã lưu thông tin thành công!");
    } catch (error) {
      showNotification(getMessage(error, "Không thể lưu thông tin."));
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    async function loadCVs() {
      try {
        setIsLoading(true);
        const data = await getCVs();
        setCvList(data.items || []);
      } catch (err: any) {
        showNotification(` Lỗi tải danh sách CV: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
    void loadCVs();
  }, []);

  const extractFilename = (key: string): string => {
    const parts = key.split('/');
    return parts[parts.length - 1];
  };

  const handleDeleteCV = async (key: string) => {
    try {
      const filename = extractFilename(key);
      showNotification(' Đang xóa CV...');
      await deleteCV(filename);
      showNotification(' Đã xóa CV thành công!');
      
      const data = await getCVs();
      setCvList(data.items || []);
    } catch (err: any) {
      showNotification(` Lỗi xóa CV: ${err.message}`);
    }
  };

  const handleUploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showNotification(' File không hợp lệ! Chỉ hỗ trợ định dạng PDF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification(' Kích thước file vượt quá giới hạn 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (cvList.length >= MAX_CVS) {
      showNotification(' Đã đạt giới hạn 3 CV. Vui lòng xóa bớt trước khi tải lên.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      showNotification(' Đang tải CV lên...');
      await uploadCV(file);
      showNotification(' Đã tải lên CV thành công!');
      
      const data = await getCVs();
      setCvList(data.items || []);
    } catch (err: any) {
      showNotification(` Lỗi tải lên CV: ${err.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
          <div className="h-56 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }


  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      {notification && (
        <div className="fixed right-6 top-20 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700 shadow-lg shadow-emerald-100/50">
          {notification}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý thông tin tài khoản và CV của bạn để tăng cơ hội trúng tuyển.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Thông tin cơ bản</h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <HiOutlinePencil className="h-4 w-4" />
            {isEditing ? (saving ? "Đang lưu..." : "Lưu thay đổi") : "Chỉnh sửa"}
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 ring-4 ring-blue-50">
              <span className="text-2xl font-bold text-blue-600">
                {(name || profile.email || "?").charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="w-full flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      isEditing
                        ? "border-blue-300 bg-white text-slate-900 ring-2 ring-blue-100 focus:outline-none focus:ring-blue-200"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Quản lý CV ({cvList.length}/{MAX_CVS})
          </h2>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleUploadCV}
              className="hidden"
              id="profile-cv-upload"
            />
            <button
              type="button"
              onClick={() => {
                if (cvList.length >= MAX_CVS) {
                  showNotification("Đã đạt giới hạn 3 CV. Vui lòng xóa bớt trước khi tải lên.");
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={cvList.length >= MAX_CVS || uploading}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                cvList.length >= MAX_CVS || uploading
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
              }`}
            >
              <HiOutlinePlusCircle className="h-4 w-4" />
              {uploading ? "Đang tải..." : "Tải CV mới"}
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-3 text-sm text-slate-500">Đang tải danh sách CV...</p>
            </div>
          ) : cvList.length === 0 ? (
            <div className="py-12 text-center">
              <HiOutlineDocumentText className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                Chưa có CV nào. Tải lên CV đầu tiên của bạn.
              </p>
            </div>
          ) : (
            cvList.map((cv, index) => (
              <div
                key={cv.key}
                className="animate-fadeIn flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-slate-50/50"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <HiOutlineDocumentText className="h-6 w-6 text-red-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <a
                    href={cv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-semibold text-slate-900 hover:text-blue-600 hover:underline block"
                  >
                    {cv.filename}
                  </a>
                  <p className="text-xs text-slate-400">
                    Cập nhật {new Date(cv.lastModified).toLocaleString('vi-VN')} • {formatFileSize(cv.sizeBytes)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      <HiOutlineCheckBadge className="h-3.5 w-3.5" />
                      Chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteCV(cv.key)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={`Xóa ${cv.filename}`}
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
