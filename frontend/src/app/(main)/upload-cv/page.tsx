'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  HiOutlineCloudArrowUp, 
  HiOutlineDocument, 
  HiOutlineXMark, 
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineCpuChip,
  HiOutlineSparkles 
} from 'react-icons/hi2';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function UploadCVPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = useCallback((file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } else {
      alert('Chỉ hỗ trợ file PDF');
    }
  }, []);

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
    },
    [handleFile]
  );

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Phân tích CV</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tải lên CV của bạn để hệ thống AI phân tích và đánh giá độ phù hợp với
          các vị trí tuyển dụng.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="hidden"
          id="cv-upload"
        />

        <div className="flex flex-col items-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${isDragOver ? 'bg-blue-100' : 'bg-slate-50'
              }`}
          >
            <HiOutlineCloudArrowUp
              className={`h-8 w-8 ${isDragOver ? 'text-blue-500' : 'text-slate-400'
                }`}
            />
          </div>

          <p className="mt-4 text-base font-semibold text-slate-700">
            {isDragOver ? 'Thả file tại đây' : 'Kéo thả CV vào đây'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            hoặc nhấn nút bên dưới để chọn file
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30"
          >
            Chọn file từ máy tính
          </button>

          <p className="mt-4 text-xs text-slate-400">
            Hỗ trợ định dạng: PDF • Tối đa 10MB
          </p>
        </div>
      </div>

      {/* Uploaded File Preview */}
      {uploadedFile && (
        <div className="mt-6 animate-fadeIn rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <HiOutlineDocument className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
              <button
                type="button"
                onClick={removeFile}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      {uploadedFile && (
        <div className="mt-6 animate-slideUp">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-blue-800"
          >
            <HiOutlineCpuChip className="h-5 w-5" />
            Bắt đầu phân tích CV
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">
            * Tính năng đang trong giai đoạn phát triển. Kết quả sẽ hiện thị
            tại trang Lịch sử đánh giá.
          </p>
        </div>
      )}

      {/* Info Cards */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: <HiOutlineDocumentText className="mx-auto h-8 w-8 text-blue-500" />,
            title: 'Tải lên CV',
            desc: 'Tải lên CV ở định dạng PDF',
          },
          {
            icon: <HiOutlineCpuChip className="mx-auto h-8 w-8 text-blue-500" />,
            title: 'Phân tích bằng AI',
            desc: 'Hệ thống AI trích xuất kỹ năng và kinh nghiệm',
          },
          {
            icon: <HiOutlineSparkles className="mx-auto h-8 w-8 text-blue-500" />,
            title: 'Điểm phù hợp',
            desc: 'Nhận điểm số phù hợp với từng vị trí',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-4 text-center"
          >
            <div className="flex justify-center mb-2">{item.icon}</div>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {item.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
