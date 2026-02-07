import React from 'react';
import { useFollow } from '@/hooks/useFollow';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline';
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const { isFollowing, loading, follow, unfollow, setIsFollowing } = useFollow();

  React.useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing, setIsFollowing]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const success = isFollowing 
      ? await unfollow(userId) 
      : await follow(userId);

    if (success && onFollowChange) {
      onFollowChange(!isFollowing);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: isFollowing
      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      : 'bg-[#E8998D] text-white hover:bg-[#d88a7e]',
    outline: isFollowing
      ? 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
      : 'border-2 border-[#E8998D] text-[#E8998D] hover:bg-[#E8998D] hover:text-white',
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full
        font-medium
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        flex
        items-center
        justify-center
        gap-2
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </>
      ) : (
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
      )}
    </button>
  );
};

// Compact version for use in lists/grids
interface FollowButtonCompactProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButtonCompact: React.FC<FollowButtonCompactProps> = ({
  userId,
  initialIsFollowing = false,
  onFollowChange,
}) => {
  const { isFollowing, loading, follow, unfollow, setIsFollowing } = useFollow();

  React.useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing, setIsFollowing]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const success = isFollowing 
      ? await unfollow(userId) 
      : await follow(userId);

    if (success && onFollowChange) {
      onFollowChange(!isFollowing);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        px-3 py-1 text-xs rounded-full font-medium transition-all
        ${isFollowing 
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
          : 'bg-[#E8998D] text-white hover:bg-[#d88a7e]'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {loading ? '...' : isFollowing ? '✓ Following' : '+ Follow'}
    </button>
  );
};
