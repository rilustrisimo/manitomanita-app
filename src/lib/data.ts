import type { Group, User } from './types';

export const mockUser: User = {
  id: 'user_1',
  name: 'Alex Doe',
  avatarUrl: 'https://i.pravatar.cc/150?u=alex_doe',
};

export const mockGroups: Group[] = [
  {
    id: 'group_1',
    name: 'Office Holiday Exchange 2024',
    exchangeDate: '2024-12-20',
    spendingMinimum: 25,
    isPro: true,
    matchingCompleted: true,
    matches: {
      'user_1': 'user_2',
      'user_2': 'user_3',
      'user_3': 'user_4',
      'user_4': 'user_1',
    },
    members: [
      {
        id: 'user_1',
        name: 'Alex Doe',
        screenName: 'The Grinch',
        avatarUrl: 'https://i.pravatar.cc/150?u=group_1_user_1',
        isModerator: true,
        wishlist: [
          { id: 'w1_1', name: 'Mechanical Keyboard', description: 'A tenkeyless (TKL) with brown switches.', links: ['https://www.lazada.com.ph'] },
          { id: 'w1_2', name: 'Cold Brew Coffee Maker', description: 'Something easy to clean.', links: ['https://www.shopee.ph'] },
        ],
        comments: [
          { from: 'anonymous', text: 'Great team lead!' }
        ],
      },
      {
        id: 'user_2',
        name: 'Ben Smith',
        screenName: 'Santa\'s Helper',
        avatarUrl: 'https://i.pravatar.cc/150?u=group_1_user_2',
        isModerator: false,
        wishlist: [
          { id: 'w2_1', name: 'Artisanal Tea Set', description: 'Loves green and oolong tea.' },
          { id: 'w2_2', name: 'A good book on design', description: 'Anything by Kenya Hara.' },
        ],
        comments: [
          { from: 'anonymous', text: 'Always helpful with designs.' }
        ],
      },
      {
        id: 'user_3',
        name: 'Chloe Garcia',
        screenName: 'Jingle Belle',
        avatarUrl: 'https://i.pravatar.cc/150?u=group_1_user_3',
        isModerator: false,
        wishlist: [
          { id: 'w3_1', name: 'Indoor plant', description: 'A snake plant or a ZZ plant.' },
        ],
        comments: [],
      },
      {
        id: 'user_4',
        name: 'David Lee',
        screenName: 'Sir Gifts-a-Lot',
        avatarUrl: 'https://i.pravatar.cc/150?u=group_1_user_4',
        isModerator: false,
        wishlist: [
          { id: 'w4_1', name: 'Smart water bottle', description: 'One that tracks intake.' },
          { id: 'w4_2', name: 'Noise-cancelling headphones', description: 'Good for focusing at work.', links: ['https://www.lazada.com.ph'] },
        ],
        comments: [],
      },
    ],
  },
  {
    id: 'group_2',
    name: 'Friendsmas 2024',
    exchangeDate: '2024-12-23',
    spendingMinimum: 50,
    isPro: false,
    matchingCompleted: false,
    members: [
      {
        id: 'user_1',
        name: 'Alex Doe',
        screenName: 'Captain Cook',
        avatarUrl: 'https://i.pravatar.cc/150?u=group_2_user_1',
        isModerator: true,
        wishlist: [
          { id: 'fw1_1', name: 'Board Game - Wingspan', description: 'Heard great things about it!' },
        ],
        comments: [],
      },
      {
        id: 'user_5',
        name: 'Eva Chen',
        screenName: 'The Baker',
        avatarUrl: 'https://i.pravatar.cc/150?u=group_2_user_5',
        isModerator: false,
        wishlist: [],
        comments: [],
      },
       {
        id: 'user_6',
        name: 'Frank White',
        screenName: 'DJ Frank',
        avatarUrl: 'https://i.pravatar.cc/150?u=group_2_user_6',
        isModerator: false,
        wishlist: [],
        comments: [],
      },
    ],
  },
];
