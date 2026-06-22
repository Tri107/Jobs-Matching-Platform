'use client';

import { useState, useRef } from 'react';
import {
  HiOutlinePencil,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineCheckBadge,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { mockCurrentUser, mockUserCVs, type MockCV } from '@/mock/users';

export default function ProfilePage() {
  const [name, setName] = useState(mockCurrentUser.name);
  const [phone, setPhone] = useState(mockCurrentUser.phone);
  const [cvList, setCvList] = useState<MockCV[]>(mockUserCVs);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CVS = 3;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    setIsEditing(false);
    showNotification('Đã lưu thông tin thành công!');
  };

  const handleDeleteCV = (id: string) => {
    setCvList((prev) => prev.filter((cv) => cv.id !== id));
    showNotification('Đã xóa CV thành công!');
  };

  const handleUploadCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showNotification('❌ File không hợp lệ! Chỉ hỗ trợ định dạng PDF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (cvList.length >= MAX_CVS) {
      showNotification('Đã đạt giới hạn 3 CV. Vui lòng xóa bớt trước khi tải lên.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const newCV: MockCV = {
      id: `cv-${Date.now()}`,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      uploadedAt: 'vừa xong',
      status: 'analyzing',
      isPrimary: cvList.length === 0,
    };
    setCvList((prev) => [...prev, newCV]);
    showNotification('Đã tải lên CV thành công!');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-fadeIn rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700 shadow-lg shadow-emerald-100/50">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý thông tin tài khoản và CV của bạn để tăng cơ hội trúng tuyển.
        </p>
      </div>

      {/* Basic Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Thông tin cơ bản</h2>
          <button
            type="button"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <HiOutlinePencil className="h-4 w-4" />
            {isEditing ? 'Lưu thay đổi' : 'Lưu thay đổi'}
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 ring-4 ring-blue-50">
                <span className="text-2xl font-bold text-blue-600">
                  {name.charAt(0)}
                </span>
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-transform hover:scale-110"
              >
                <HiOutlinePencil className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 w-full">
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
                        ? 'border-blue-300 bg-white text-slate-900 ring-2 ring-blue-100 focus:outline-none focus:ring-blue-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      isEditing
                        ? 'border-blue-300 bg-white text-slate-900 ring-2 ring-blue-100 focus:outline-none focus:ring-blue-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
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
                  value={mockCurrentUser.email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CV Management Card */}
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
                  showNotification('Đã đạt giới hạn 3 CV. Vui lòng xóa bớt trước khi tải lên.');
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={cvList.length >= MAX_CVS}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                cvList.length >= MAX_CVS
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700'
              }`}
            >
              <HiOutlinePlusCircle className="h-4 w-4" />
              Tải CV mới
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {cvList.length === 0 ? (
            <div className="py-12 text-center">
              <HiOutlineDocumentText className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                Chưa có CV nào. Tải lên CV đầu tiên của bạn!
              </p>
            </div>
          ) : (
            cvList.map((cv, index) => (
              <div
                key={cv.id}
                className="animate-fadeIn flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-slate-50/50"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* PDF Icon */}
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <HiOutlineDocumentText className="h-6 w-6 text-red-500" />
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {cv.fileName}
                  </p>
                  <p className="text-xs text-slate-400">
                    Cập nhật {cv.uploadedAt}
                  </p>
                </div>

                {/* Badge & Actions */}
                <div className="flex items-center gap-2">
                  {cv.isPrimary && (
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      <HiOutlineCheckBadge className="h-3.5 w-3.5" />
                      Chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteCV(cv.id)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
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
