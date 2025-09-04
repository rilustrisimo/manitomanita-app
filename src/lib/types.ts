export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  profileImagePath?: string | null;
}

export interface WishlistItem {
  id: string;
  name: string;
  description: string;
  links?: string[];
}

export interface Member extends User {
  screenName: string;
  isModerator: boolean;
  wishlist: WishlistItem[];
  comments: { from: string; text: string }[];
  profileImagePath?: string | null;
}

export interface Group {
  id: string;
  name: string;
  exchangeDate: string;
  spendingMinimum: number;
  members: Member[];
  isPro: boolean;
  matchingCompleted: boolean;
  matches?: Record<string, string>; // { giverId: receiverId }
}
