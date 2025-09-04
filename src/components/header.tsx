'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useAccountProfile } from '@/hooks/use-account-profile';
import ProfileAvatar from '@/components/profile-avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useAccountProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  // Use profile data when available, fallback to auth user data
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const profileImagePath = profile?.profile_image_url;
  const userId = user?.id;

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
              <Image 
                src="/logo.svg" 
                alt="ManitoManita Logo" 
                width={32} 
                height={32}
                className="w-8 h-8"
              />
              <span className="text-2xl font-headline">
                <span className="font-bold" style={{ color: '#1b1b1b' }}>Manito</span>
                <span className="font-bold text-[#3ec7c2]">Manita</span>
              </span>
            </Link>
          </div>

          {/* Desktop User menu or auth buttons - moved to right */}
          <div className="hidden md:flex items-center space-x-3">
            {user && (
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                Dashboard
              </Link>
            )}
            {loading || profileLoading ? (
              <div className="animate-pulse bg-gray-200 rounded-full h-9 w-9"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-gray-100/50 transition-colors duration-200 p-0">
                    <ProfileAvatar
                      userId={userId || ''}
                      profileImagePath={profileImagePath}
                      displayName={displayName}
                      className="h-9 w-9"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-lg shadow-gray-200/50 rounded-2xl p-2" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-3 bg-gray-50/50 rounded-xl mb-2">
                    <ProfileAvatar
                      userId={userId || ''}
                      profileImagePath={profileImagePath}
                      displayName={displayName}
                      className="h-10 w-10"
                    />
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-gray-900">
                        {displayName}
                      </p>
                      <p className="w-[180px] truncate text-xs text-gray-500">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link href="/profile" className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100/50">
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link href="/settings" className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100/50">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-t border-gray-200/50 my-2"></div>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50/50 rounded-xl py-2 px-3">
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl font-medium">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-medium rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-200 transform hover:scale-105">
                  <Link href="/register">Create Group</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 rounded-xl hover:bg-gray-100/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl mb-3">
                    <ProfileAvatar
                      userId={userId || ''}
                      profileImagePath={profileImagePath}
                      displayName={displayName}
                      className="h-8 w-8"
                    />
                    <div className="flex flex-col">
                      <p className="font-medium text-sm text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  
                  {/* Navigation links */}
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  
                  <div className="border-t border-gray-200/50 my-2"></div>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50/50 rounded-xl font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 bg-gradient-to-r from-accent to-accent/90 text-white font-medium rounded-xl text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
