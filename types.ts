

export type Tab = 'chat' | 'videos' | 'shorts' | 'stylist' | 'profile' | 'business';

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // User IDs who voted
}

export interface Poll {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
}

export interface Topic {
    id: string;
    name: string;
    isSecret?: boolean; // Admin only
    unreadCount?: number;
}

export interface GroupEvent {
    id: string;
    title: string;
    date: number; // Timestamp
    description: string;
    attendees: string[];
}

export interface DriveFile {
    id: string;
    name: string;
    type: 'image' | 'video' | 'doc' | 'audio';
    url: string;
    size: string;
    uploadedBy: string;
    timestamp: number;
}

export type AttachmentType = 
  | 'image' 
  | 'video' 
  | 'file' 
  | 'document' 
  | 'sticker' 
  | 'audio' 
  | 'voice' 
  | 'location' 
  | 'live_location' 
  | 'contact' 
  | 'poll' 
  | 'event' 
  | 'template'
  | 'record';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'other' | string; // ID or username
  senderName?: string; // Display name for groups
  senderAvatar?: string;
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read'; 
  isEdited?: boolean;
  isForwarded?: boolean;
  isStarred?: boolean;
  isSystem?: boolean; // Activity Log (e.g., "User left")
  isPending?: boolean; // Approval Mode
  isPinned?: boolean; // Announcement Booster
  expiresAt?: number; // Temporary Message timestamp
  topicId?: string; // Thread/Topic ID
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
    attachment?: {
        type: AttachmentType;
        url: string;
    };
  };
  reactions?: Record<string, string[]>; // emoji -> [user_ids]
  poll?: Poll;
  attachment?: {
    type: AttachmentType;
    url: string;
    name: string;
    size?: string; 
    mimeType?: string; 
  };
}

export interface ChatNotificationSettings {
    mode: 'all' | 'mentions_only' | 'mute';
    tone: string;
}

export interface GeneratedOutfit {
  type: string;
  title: string;
  description: string;
  imageUrl: string;
  loading?: boolean;
  visual_prompt?: string;
}

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  type: 'video' | 'audio';
  partnerName: string;
  partnerAvatar: string;
  isGroupCall?: boolean;
}

export interface UserSettings {
  notifications: boolean;
  messageSound: boolean;
  vibration: boolean;
  notificationTone: string;
  
  theme: string;
  fontSize: string;
  language: string;
  chatWallpaper: string;

  privacy: boolean;
  autoBlockDuration: string;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  appLockEnabled: boolean;

  autoDownloadWifi: boolean;
  autoDownloadMobile: boolean;

  gpsEnabled: boolean;
  cameraPermission: boolean;
  microphonePermission: boolean;
  storagePermission: boolean;
  backgroundActivity: boolean;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  phoneNumber: string;
  email: string;
  isVerified: boolean;
  avatar: string;
  subscriptionPlan: string;
  followers: number;
  following: number;
  badges: BadgeType[];
  walletBalance: number;
}

export interface AppSettings {
  appName: string;
  logoUrl?: string;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  avatar: string;
  timeAgo: string;
}

export interface VideoItem {
  id: string;
  title: string;
  author: string;
  views: string;
  timeAgo: string;
  thumbnail: string;
  videoUrl: string;
  likesCount: number;
  comments: Comment[];
  category: string;
  isLiked?: boolean;
}

export interface ShortItem {
  id: string;
  title: string;
  author: string;
  color: string;
  likesCount: number;
  comments: Comment[];
  videoUrl?: string;
  musicTrack?: string;
  shareUrl?: string;
  isAd?: boolean;
  adLink?: string;
  flashDealImage?: string;
  privacy?: string;
  isAudio?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  dislikesCount?: number;
  isFollowed?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  brand?: string;
  last4?: string;
  expiry?: string;
  upiId?: string;
  isDefault: boolean;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: string;
  description: string;
  status: 'paid' | 'refunded';
  downloadUrl: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'resolved' | 'pending' | 'open';
  date: string;
  message?: string;
}

export type BadgeType = 'verified' | 'pro' | 'top-creator' | 'admin';