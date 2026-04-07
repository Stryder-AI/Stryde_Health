import { useRef, useState, useCallback } from 'react';
import { Camera, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<AvatarSize, { px: number; className: string; iconSize: string; overlayIcon: string; badgeClass: string }> = {
  sm: { px: 48, className: 'w-12 h-12', iconSize: 'w-5 h-5', overlayIcon: 'w-4 h-4', badgeClass: 'w-5 h-5 -top-0.5 -right-0.5' },
  md: { px: 80, className: 'w-20 h-20', iconSize: 'w-8 h-8', overlayIcon: 'w-5 h-5', badgeClass: 'w-6 h-6 -top-0.5 -right-0.5' },
  lg: { px: 120, className: 'w-[120px] h-[120px]', iconSize: 'w-10 h-10', overlayIcon: 'w-6 h-6', badgeClass: 'w-7 h-7 top-0 right-0' },
};

const gradients = [
  'from-[#0d9488] to-[#0891b2]',
  'from-[#8b5cf6] to-[#7c3aed]',
  'from-[#ec4899] to-[#a855f7]',
  'from-[#f59e0b] to-[#ef4444]',
  'from-[#10b981] to-[#3b82f6]',
];

function getGradient(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

interface AvatarUploadProps {
  initials: string;
  size?: AvatarSize;
  onChange?: (file: File | null) => void;
  value?: string;
}

export function AvatarUpload({
  initials,
  size = 'md',
  onChange,
  value,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizes = sizeMap[size];
  const gradient = getGradient(initials || 'U');
  const displayInitials = initials
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        setError('Only JPG, PNG or WebP images are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        onChange?.(file);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onChange?.(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group" style={{ width: sizes.px, height: sizes.px }}>
        {/* Circle */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            sizes.className,
            'rounded-full overflow-hidden cursor-pointer select-none',
            'ring-2 ring-[var(--surface-border)] transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
            isDragging && 'ring-[var(--primary)] ring-4 scale-105',
            !isDragging && 'group-hover:ring-[var(--primary)]',
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div
              className={cn(
                'w-full h-full flex items-center justify-center bg-gradient-to-br',
                gradient,
              )}
            >
              {displayInitials ? (
                <span className="text-white font-bold select-none" style={{ fontSize: sizes.px * 0.3 }}>
                  {displayInitials}
                </span>
              ) : (
                <User className={cn(sizes.iconSize, 'text-white/80')} />
              )}
            </div>
          )}

          {/* Hover overlay */}
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            )}
          >
            <Camera className={cn(sizes.overlayIcon, 'text-white')} />
            <span className="text-white text-[10px] font-medium mt-1">
              {preview ? 'Change' : 'Upload'}
            </span>
          </div>
        </div>

        {/* Remove button */}
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'absolute flex items-center justify-center rounded-full',
              'bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md',
              sizes.badgeClass,
            )}
            aria-label="Remove photo"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload avatar"
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 text-center max-w-[140px]">{error}</p>
      )}

      {/* Hint */}
      {!error && (
        <p className="text-[11px] text-[var(--text-tertiary)]">
          {preview ? 'Click to change photo' : 'Click or drag to upload'}
        </p>
      )}
    </div>
  );
}
