import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import { Input } from '../ui/Input';
import {
  validateImageFile,
  formatFileSize,
  resolveImageUrl,
  FALLBACK_RESTAURANT_IMAGE,
  onRestaurantImgError,
} from '../../lib/imageUtils';
import { restaurantsApi } from '../../api/restaurants';

export interface NativeImagePickerProps {
  id?: string;
  label?: string;
  description?: string;
  value?: string;
  onChange: (value: string, file?: File) => void;
  restaurantId?: number | string;
  fallbackImage?: string;
  disabled?: boolean;
}

export const NativeImagePicker: React.FC<NativeImagePickerProps> = ({
  id = 'native-image-picker-input',
  label = 'Image',
  description = 'Supports JPEG, PNG, or WebP up to 5MB',
  value = '',
  onChange,
  restaurantId,
  fallbackImage = FALLBACK_RESTAURANT_IMAGE,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs when unmounted or changed
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Open the device's native file selection picker
  const triggerNativeFilePicker = () => {
    if (disabled || isUploading) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (file: File) => {
    setValidationError(null);
    setUploadError(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file format.');
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);

    // If restaurantId is known, auto-upload to S3 right away
    if (restaurantId) {
      try {
        setIsUploading(true);
        setUploadProgress(10);

        const presigned = await restaurantsApi.getUploadUrl(restaurantId, file.name, file.type);
        setUploadProgress(30);

        await restaurantsApi.uploadFileToS3(presigned.uploadUrl, file, (percent) => {
          setUploadProgress(30 + Math.round((percent * 65) / 100));
        });

        setUploadProgress(100);
        onChange(presigned.objectKey, file);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to upload image to cloud storage.';
        setUploadError(msg);
        // Fallback to storing the file for retry
        onChange(objectUrl, file);
      } finally {
        setIsUploading(false);
      }
    } else {
      // For new restaurants without an ID yet, pass the file to be uploaded after creation
      onChange(objectUrl, file);
    }
  };

  const handleRemove = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    setUploadError(null);
    setUploadProgress(0);
    setManualUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange('', undefined);
  }, [previewUrl, onChange]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
    e.target.value = '';
  };

  const hasExistingImage = !!value && value.trim() !== '';
  const displayImage = previewUrl || (hasExistingImage ? resolveImageUrl(value, fallbackImage) : null);

  return (
    <div className="space-y-2">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-charcoal">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-[11px] text-charcoal-muted hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon size={11} />
          <span>{showUrlFallback ? 'Upload from device' : 'Or enter URL'}</span>
        </button>
      </div>

      {/* Visually hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        name={id}
        accept="image/jpeg,image/png,image/webp"
        multiple={false}
        className="sr-only"
        onChange={onInputChange}
        disabled={disabled || isUploading}
        aria-label={label}
      />

      {/* Manual URL Input (only when explicitly toggled) */}
      {showUrlFallback ? (
        <div className="space-y-2">
          <Input
            value={manualUrl}
            onChange={(e) => {
              setManualUrl(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="https://example.com/photo.jpg or S3 object key"
            disabled={disabled || isUploading}
          />
          {manualUrl && (
            <div className="flex items-center gap-3 p-2 bg-cream-surface rounded-xl border border-cream-border/70">
              <img
                src={resolveImageUrl(manualUrl, fallbackImage)}
                alt="URL Preview"
                onError={onRestaurantImgError}
                className="w-14 h-10 object-cover rounded-lg border border-cream-border"
              />
              <span className="text-[11px] text-charcoal-muted truncate">
                Preview from URL
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Native Device File Selection Dropzone & Preview */
        <div>
          {!displayImage ? (
            /* Empty State: Click to open device file picker */
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={triggerNativeFilePicker}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150 ${
                isDragging
                  ? 'border-primary bg-primary-surface/40 scale-[1.01]'
                  : 'border-cream-border hover:border-primary/50 hover:bg-cream-surface/60 bg-cream-surface/20'
              }`}
              role="region"
              aria-label={`Upload ${label}`}
            >
              <div className="flex flex-col items-center justify-center space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-primary-surface text-primary flex items-center justify-center shadow-warm-sm">
                  <UploadCloud size={22} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-charcoal">
                    Click to select image from your device
                  </p>
                  <p className="text-[11px] text-charcoal-muted">
                    {description}
                  </p>
                </div>
                <label
                  htmlFor={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerNativeFilePicker();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-card hover:bg-cream-surface text-charcoal font-semibold text-xs rounded-lg border border-cream-border shadow-warm-sm transition-all cursor-pointer mt-1"
                >
                  <Upload size={12} className="text-primary" />
                  <span>Browse Files</span>
                </label>
              </div>
            </div>
          ) : (
            /* Selected File / Existing Image Preview State */
            <div className="space-y-2.5 p-3 bg-cream-surface rounded-xl border border-cream-border/80">
              <div className="flex items-center gap-3.5">
                {/* Thumbnail Preview */}
                <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-cream-border bg-charcoal/5 shrink-0 shadow-warm-sm">
                  <img
                    src={displayImage}
                    alt="Selected Preview"
                    onError={onRestaurantImgError}
                    className="w-full h-full object-cover"
                  />
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="absolute top-1 right-1 p-1 bg-charcoal/70 hover:bg-charcoal text-cream rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* File / Image Info & Action Buttons */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-charcoal truncate">
                      {selectedFile ? selectedFile.name : 'Image selected'}
                    </p>
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    {selectedFile
                      ? formatFileSize(selectedFile.size)
                      : value.startsWith('restaurants/')
                        ? 'Saved in cloud storage'
                        : 'Active image'}
                  </p>

                  {/* Actions: Choose Another or Remove */}
                  {!isUploading && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <label
                        htmlFor={id}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerNativeFilePicker();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        <Upload size={11} />
                        <span>Choose Image</span>
                      </label>
                      <span className="text-charcoal-faint text-[10px]">|</span>
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar (Visible during S3 background upload) */}
              {isUploading && (
                <div className="space-y-1 pt-1 border-t border-cream-border/60">
                  <div className="flex justify-between text-[11px] text-charcoal-muted">
                    <span className="flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin text-primary" />
                      Uploading to secure S3 storage...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-cream-border overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Success Badge */}
              {uploadProgress === 100 && !isUploading && (
                <div className="text-[11px] text-emerald-800 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={13} className="text-emerald-700" />
                  <span>Image uploaded and linked</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Validation or Upload Error Banner */}
      {(validationError || uploadError) && (
        <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="text-rose-700 shrink-0" />
          <span>{validationError || uploadError}</span>
        </div>
      )}
    </div>
  );
};
