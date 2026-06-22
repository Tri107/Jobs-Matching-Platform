'use client';

import { useState, useRef, useCallback } from 'react';
import {
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineFunnel,
  HiOutlineXMark,
} from 'react-icons/hi2';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'processed' | 'analyzing';
}

const initialFiles: UploadedFile[] = [
  {
    id: 'f1',
    name: 'CV_Senior_Frontend_2024.pdf',
    size: '1.2 MB',
    uploadedAt: '20/05/2024',
    status: 'processed',
  },
  {
    id: 'f2',
    name: 'CV_UX_Designer_Final.pdf',
    size: '850 KB',
    uploadedAt: '19/05/2024',
    status: 'analyzing',
  },
];

export default function UploadCVPage() {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 3;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFile = useCallback(
    (file: File) => {
      // PDF-only validation
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showNotification('❌ File không hợp lệ! Chỉ hỗ trợ định dạng PDF.');
        return;
      }

      if (files.length >= MAX_FILES) {
        showNotification(`Đã đạt giới hạn ${MAX_FILES} CV. Vui lòng xóa bớt trước khi tải lên.`);
        return;
      }

      const newFile: UploadedFile = {
        id: `f-${Date.now()}`,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: new Date().toLocaleDateString('vi-VN'),
        status: 'analyzing',
      };

      setFiles((prev) => [newFile, ...prev]);
      showNotification('✅ Đã tải lên CV thành công!');
    },
    [files.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFile]
  );

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showNotification('Đã xóa CV thành công!');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-fadeIn rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-xl">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tải lên CV của bạn</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sử dụng sức mạnh của AI để phân tích và tối ưu hóa hồ sơ năng lực của bạn.
        </p>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (files.length >= MAX_FILES) {
            showNotification(`Đã đạt giới hạn ${MAX_FILES} CV. Vui lòng xóa bớt trước khi tải lên.`);
            return;
          }
          fileInputRef.current?.click();
        }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all sm:p-14 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50/60'
            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="hidden"
          id="cv-upload-input"
        />

        <div className="flex flex-col items-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
              isDragOver ? 'bg-blue-100' : 'bg-slate-100'
            }`}
          >
            <HiOutlineCloudArrowUp
              className={`h-8 w-8 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`}
            />
          </div>

          <p className="mt-5 text-base font-bold text-slate-800">
            {isDragOver ? 'Thả file tại đây' : 'Kéo và thả CV vào đây'}
          </p>
          <p className="mt-1.5 text-sm text-slate-500">
            Hoặc nhấn để chọn file từ máy tính
          </p>

          {/* Format badges */}
          <div className="mt-5 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <HiOutlineDocumentText className="h-4 w-4 text-red-400" />
              PDF
            </span>
          </div>

          {files.length >= MAX_FILES && (
            <p className="mt-4 text-xs font-semibold text-amber-600">
              ⚠ Đã đạt giới hạn {MAX_FILES} file. Xóa bớt để tải thêm.
            </p>
          )}
        </div>
      </div>

      {/* File List Table */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Danh sách CV đã tải
          </h3>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <HiOutlineFunnel className="h-4 w-4" />
            Lọc
          </button>
        </div>

        {files.length === 0 ? (
          <div className="py-16 text-center">
            <HiOutlineDocumentText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Chưa có CV nào. Hãy tải lên CV đầu tiên của bạn!
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3">Tên file</th>
                    <th className="px-6 py-3">Ngày tải</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className="animate-fadeIn transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                            <HiOutlineDocumentText className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-400">{file.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {file.uploadedAt}
                      </td>
                      <td className="px-6 py-4">
                        {file.status === 'processed' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Đã xử lý
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                            Đang phân tích
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                            title="Xem"
                          >
                            <HiOutlineEye className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(file.id)}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            title="Xóa"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="animate-fadeIn rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                        <HiOutlineDocumentText className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-400">
                          {file.size} • {file.uploadedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {file.status === 'processed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Đã xử lý
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                        Đang phân tích
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-500"
                      >
                        <HiOutlineEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(file.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
