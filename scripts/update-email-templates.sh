#!/bin/bash
# Instructions to update Supabase email templates with Manito Manita branding
# Email templates must be updated through the Supabase dashboard

echo "🎁 Manito Manita Email Template Setup Instructions"
echo "=================================================="
echo ""

# Get project reference from config
PROJECT_REF=$(grep 'project_id' supabase/config.toml | cut -d'"' -f2)

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Could not find project_id in supabase/config.toml"
    exit 1
fi

echo "📧 Project: $PROJECT_REF"
echo ""
echo "🌐 Dashboard URL: https://supabase.com/dashboard/project/$PROJECT_REF/auth/templates"
echo ""
echo "� INSTRUCTIONS:"
echo "1. Open the dashboard URL above in your browser"
echo "2. Navigate to Authentication > Email Templates"
echo "3. Update each template with the content from these files:"
echo ""
echo "   📨 Email Confirmation:"
echo "       File: supabase/templates/confirmation.html"
echo "       Subject: Welcome to Manito Manita! Please confirm your email"
echo ""
echo "   🔐 Password Recovery:"
echo "       File: supabase/templates/recovery.html"
echo "       Subject: Reset your Manito Manita password"
echo ""
echo "   📩 User Invitation:"
echo "       File: supabase/templates/invite.html"
echo "       Subject: You've been invited to join Manito Manita"
echo ""
echo "   📮 Email Change:"
echo "       File: supabase/templates/email_change.html"
echo "       Subject: Confirm your new email for Manito Manita"
echo ""
echo "🎨 TEMPLATE FEATURES:"
echo "   ✅ Manito Manita branding and colors"
echo "   ✅ Professional email design"
echo "   ✅ Clear call-to-action buttons"
echo "   ✅ Security notices and instructions"
echo "   ✅ Responsive mobile-friendly layout"
echo ""
echo "🧪 TESTING:"
echo "   After updating templates, test by:"
echo "   1. Creating a new user account"
echo "   2. Using the forgot password flow"
echo "   3. Checking email for branded templates"
echo ""
echo "📁 Template files are located in: ./supabase/templates/"
echo ""

# Show template file contents
echo "📄 TEMPLATE FILE CONTENTS:"
echo ""
for template in supabase/templates/*.html; do
    if [ -f "$template" ]; then
        echo "🔹 $(basename $template):"
        echo "   Path: $template"
        echo "   Size: $(wc -c < "$template") bytes"
        echo ""
    fi
done

echo "💡 TIP: Copy and paste the HTML content from each file into the"
echo "    corresponding template editor in the Supabase dashboard."
echo ""
echo "🎉 Happy emailing with Manito Manita branding!"
