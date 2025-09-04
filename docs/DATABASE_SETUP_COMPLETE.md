# Supabase Database Reset & Schema Setup - Complete

## ✅ **Database Reset Completed Successfully**

The Supabase database has been completely reset and recreated with a comprehensive schema following your exact specifications.

## **Schema Overview**

### **Tables Created:**

1. **`groups`** - Gift exchange groups
   - `id` (auto generated UUID)
   - `group_name` 
   - `moderator_user_id` (references auth.users)
   - `moderator_name` (from auth metadata)
   - `moderator_email` (from auth metadata)
   - `gift_exchange_date`
   - `spending_minimum`
   - `is_matched` (boolean, default false)
   - `is_pro` (boolean, default false) ✨ **NEW**
   - Timestamps: `created_at`, `updated_at`

2. **`user_profiles`** - Created when users join groups
   - `id` (auto generated UUID)
   - `main_user_id` (references auth.users) ✨ **UPDATED**
   - `email`
   - `screen_name`
   - `phone_number` ✨ **NEW**
   - `delivery_address` ✨ **NEW**
   - `profile_image_url`
   - Timestamps: `created_at`, `updated_at`

3. **`memberships`** - Links users to groups
   - `id` (auto generated UUID)
   - `group_id` (references groups)
   - `user_id` (references user_profiles)
   - `role` (moderator/member)
   - `assigned_pair_user_id` (for matching)
   - Timestamps: `created_at`, `updated_at`

4. **`wishlist_items`** - User wishlists per group
   - `id` (auto generated UUID)
   - `user_id` (references user_profiles)
   - `group_id` (references groups)
   - `description` (JSONB for multiple items) ✨ **IMPROVED**
   - Timestamps: `created_at`, `updated_at`

5. **`comments`** - General user comments
   - `id` (auto generated UUID)
   - `target_user_id` (references user_profiles)
   - `group_id` (references groups)
   - `author_user_id` (references user_profiles)
   - `content`
   - `created_at`

6. **`comments_wishlist`** - Wishlist-specific comments ✨ **NEW**
   - `id` (auto generated UUID)
   - `wishlist_item_id` (references wishlist_items)
   - `group_id` (references groups)
   - `author_user_id` (references user_profiles)
   - `content`
   - `created_at`

## **Business Logic Functions**

### **`create_group()`**
- Creates a new group with authenticated user as moderator
- Automatically extracts user info from auth.users
- Returns group ID for immediate use

### **`join_group()`**
- Creates user_profile and membership in one transaction
- Automatically assigns 'moderator' role if user created the group
- Handles profile updates if user already exists
- Returns profile ID

### **`apply_matching()`**
- Only moderators can execute matching for their groups
- Applies gift assignments atomically
- Marks group as matched
- Minimum 3 members required

## **Row Level Security (RLS) Policies**

### **Complete Privacy & Security:**
- ✅ **Groups**: Visible only to moderators and members
- ✅ **Profiles**: Visible only to people in shared groups
- ✅ **Memberships**: Visible to all group members
- ✅ **Wishlists**: All group members can see all wishlists
- ✅ **Comments**: All group members can see all comments
- ✅ **Wishlist Comments**: All group members can see wishlist-specific comments

### **Write Permissions:**
- ✅ **Groups**: Only authenticated users can create
- ✅ **Profiles**: Only through `join_group()` function
- ✅ **Wishlists**: Only group members can create for themselves
- ✅ **Comments**: Only group members can comment

## **Key Improvements & Security Features**

1. **Proper Relationships**: All foreign keys properly referenced
2. **Business Rule Enforcement**: Functions enforce your workflow exactly
3. **No Policy Recursion**: All helper functions use SECURITY DEFINER
4. **Performance Optimized**: Strategic indexes on all query patterns
5. **Data Integrity**: Constraints and checks prevent invalid data
6. **Complete Privacy**: RLS ensures users only see what they should

## **Workflow Confirmed:**

1. ✅ User registers → Only in auth.users (not user_profiles)
2. ✅ User creates group → `create_group()` function
3. ✅ Moderator joins group → `join_group()` creates profile + membership with 'moderator' role
4. ✅ Others join group → `join_group()` creates profile + membership with 'member' role
5. ✅ All group members see all profiles, wishlists, and comments
6. ✅ Only group members can create wishlists and comments
7. ✅ Separate general comments and wishlist-specific comments

## **Next Steps:**

The database is now ready for your application. You can start implementing:
- Group creation flows
- Join group functionality  
- Wishlist management
- Comment systems
- Matching algorithm integration

All functions are properly secured and follow your exact business requirements!
