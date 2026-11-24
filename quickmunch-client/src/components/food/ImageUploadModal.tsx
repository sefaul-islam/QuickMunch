import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  validateImageFile,
  formatFileSize,
  resolveImageUrl,
  onRestaurantImgError,
} from '../../lib/imageUtils';
import { restaurantsApi } from '../../api/restaurants';

export interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number | string;
  title?: string;
  description?: string;
  currentImageUrl?: string | null;
  onSuccess: (objectKey: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  title = 'Upload Image',
  description = 'Upload a high-resolution JPEG, PNG, or WebP image (max 5MB).',
  currentImageUrl,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL on unmount or when previewUrl changes to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setValidationError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploadedKey(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleClose = () => {
    if (!isUploading) {
      resetState();
      onClose();
    }
  };

  /**
   * Opens the device's native file selection picker via the standard HTML input element
   */
  const handleTriggerNativePicker = () => {
    if (isUploading) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  /**
   * Common validation & preview logic for both native file selection and drag-and-drop
   */
  const handleFileSelect = (file: File) => {
    setValidationError(null);
    setUploadError(null);
    setUploadedKey(null);

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
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
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

    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Single image selection enforcement
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile || !restaurantId) return;

    try {
      setIsUploading(true);
      setUploadProgress(5);
      setUploadError(null);

      // Step 1: Request presigned S3 PUT URL from restaurant-service
      const presigned = await restaurantsApi.getUploadUrl(
        restaurantId,
        selectedFile.name,
        selectedFile.type,
      );

      setUploadProgress(25);

      // Step 2: Upload file directly to AWS S3 (no bearer token, pure PUT)
      await restaurantsApi.uploadFileToS3(
        presigned.uploadUrl,
        selectedFile,
        (percent) => {
          // Scale from 25% to 95%
          const scaled = 25 + Math.round((percent * 70) / 100);
          setUploadProgress(scaled);
        },
      );

      setUploadProgress(100);
      setUploadedKey(presigned.objectKey);

      // Notify parent component
      onSuccess(presigned.objectKey);

      // Brief delay to display complete state before closing
      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to upload image. Please verify your connection and try again.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      maxWidth="lg"
    >
      <div className="space-y-5 pt-2">
        {/* Native file selection input - standard HTML5 file picker */}
        <input
          ref={fileInputRef}
          type="file"
          id="native-image-file-input"
          name="imageFile"
          accept="image/jpeg,image/png,image/webp"
          multiple={false}
          className="sr-only"
          onChange={onInputChange}
          disabled={isUploading}
          aria-label="Select image file"
        />

        {/* Existing / Selected Image Preview */}
        {!selectedFile ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={handleTriggerNativePicker}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
              isDragging
                ? 'border-primary bg-primary-surface/40 scale-[1.01]'
                : 'border-cream-border hover:border-primary/50 hover:bg-cream-surface/60 bg-cream-surface/20'
            }`}
            role="region"
            aria-label="Image dropzone"
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary-surface text-primary flex items-center justify-center shadow-warm-sm">
                <UploadCloud size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-charcoal">
                  Click to browse or drag and drop image here
                </p>
                <p className="text-xs text-charcoal-muted">
                  Supports JPEG, PNG, or WebP up to 5MB
                </p>
              </div>

              {/* Explicit Native File Picker Trigger Button */}
              <div className="pt-1">
                <label
                  htmlFor="native-image-file-input"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerNativePicker();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-cream-card hover:bg-cream-surface text-charcoal font-semibold text-xs rounded-xl border border-cream-border shadow-warm-sm transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <Upload size={14} className="text-primary" />
                  <span>Browse Files</span>
                </label>
              </div>

              {currentImageUrl && (
                <div className="pt-2 text-xs text-charcoal-faint flex items-center gap-1.5">
                  <ImageIcon size={13} />
                  <span>An image is currently set for this item</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview Card */}
            <div className="relative rounded-2xl overflow-hidden border border-cream-border bg-charcoal/5 max-h-64 flex items-center justify-center shadow-warm-sm">
              <img
                src={previewUrl || resolveImageUrl(currentImageUrl)}
                alt="Upload Preview"
                onError={onRestaurantImgError}
                className="w-full h-56 object-cover"
              />

              {!isUploading && !uploadedKey && (
                <button
                  type="button"
                  onClick={resetState}
                  className="absolute top-3 right-3 p-2 bg-charcoal/70 hover:bg-charcoal text-cream rounded-full backdrop-blur-sm transition-all cursor-pointer shadow-warm"
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Selected File Details & Replacement Controls */}
            <div className="flex items-center justify-between p-3.5 bg-cream-surface rounded-xl border border-cream-border/70 text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-primary-surface text-primary flex items-center justify-center shrink-0">
                  <ImageIcon size={16} />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-charcoal truncate">{selectedFile.name}</p>
                  <p className="text-charcoal-muted text-[11px]">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>

              {!isUploading && !uploadedKey && (
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <label
                    htmlFor="native-image-file-input"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerNativePicker();
                    }}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer text-xs"
                    title="Choose another image from your device"
                    role="button"
                    tabIndex={0}
                  >
                    <Upload size={12} />
                    <span>Choose Image</span>
                  </label>
                  <span className="text-charcoal-faint">|</span>
                  <button
                    type="button"
                    onClick={resetState}
                    className="text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer text-xs"
                    title="Remove selected image"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar (Visible during upload or success) */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-charcoal-muted font-medium">
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-primary" />
                    Uploading to secure storage...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-cream-border overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Banner */}
            {uploadedKey && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span className="font-medium">Image uploaded successfully! Saving changes...</span>
              </div>
            )}
          </div>
        )}

        {/* Validation or Upload Error Banner */}
        {(validationError || uploadError) && (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-700 shrink-0" />
            <span>{validationError || uploadError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-border/60">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>

          {selectedFile && !uploadedKey && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={isUploading}
            >
              Upload Image
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
