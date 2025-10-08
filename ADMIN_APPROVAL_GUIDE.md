# Admin Guide: How to Approve Teacher Applications

This guide explains how to review and approve/reject teacher applications in TutoSmart Learn.

## Accessing the Admin Dashboard

1. **Login** to TutoSmart Learn using your admin credentials:
   - Email: `luckilyimat@gmail.com` (CEO & Co-Founder - Kudzwai Madyavanhu)
   - Email: `chiwandiretakunda75@gmail.com` (COO & Co-Founder - Takunda Chiwandire)

2. After login, you'll be automatically redirected to the **Admin Dashboard**

## Reviewing Teacher Applications

### Step 1: Navigate to Teachers Tab

1. On the Admin Dashboard, you'll see statistics cards at the top showing:
   - Total Students
   - Total Teachers
   - **Pending Approvals** (this shows how many teachers need review)
   - Active Subscriptions
   - Total Revenue

2. Click on the **"Teachers" tab** in the main content area

### Step 2: Review Teacher Information

For each pending teacher application, you can see:

- **Full Name**: Teacher's complete name
- **Email**: Contact email address
- **Subjects**: List of subjects they can teach (e.g., "Mathematics, Physics, Chemistry")
- **Experience**: Years of teaching experience
- **Location**: City where they're based
- **Status Badge**: Shows current status (Pending, Approved, or Rejected)

### Step 3: Verify Teacher Qualifications

**Before approving**, you should verify:

1. **Qualifications Tab** (Future Enhancement):
   - Check uploaded certificates
   - Verify educational background
   - Review teaching credentials

2. **Profile Information**:
   - Ensure subjects match their qualifications
   - Verify experience years are realistic
   - Check location information is complete

### Step 4: Approve or Reject

**For PENDING teachers**, you'll see two action buttons:

#### To Approve:
1. Click the **"Approve" button** (green/default button)
2. The system will:
   - Update the teacher's status to "approved"
   - Set `approved = true` in the database
   - Allow the teacher to access the Teacher Dashboard
   - Make the teacher visible to students searching for tutors
3. You'll see a success toast: "Teacher approved successfully"

#### To Reject:
1. Click the **"Reject" button** (red/destructive button)
2. The system will:
   - Update the teacher's status to "rejected"
   - Set `approved = false` in the database
   - Teacher will remain on the "Pending Approval" screen
   - Teacher will NOT be visible to students
3. You'll see a success toast: "Teacher rejected successfully"

### Step 5: Monitor Approved Teachers

After approval:
- The teacher will appear in your Teachers list with **"approved"** badge
- They can now:
  - Access their Teacher Dashboard
  - View student subscriptions
  - Upload educational content to the Tuto Library
  - Earn from subscriptions and content views
- Students can find them when searching for tutors

## Important Notes

### Teacher Approval Criteria

Consider approving teachers who:
- ✅ Have verified qualifications
- ✅ Have relevant teaching experience
- ✅ Provide complete profile information
- ✅ Teach subjects aligned with their credentials
- ✅ Have professional contact information

### Rejection Reasons

Consider rejecting if:
- ❌ Incomplete profile information
- ❌ Suspicious or fraudulent credentials
- ❌ No relevant teaching experience
- ❌ Subjects don't match qualifications
- ❌ Inappropriate content or behavior

### After Rejection

- Rejected teachers can:
  - Update their application
  - Re-submit for review (Future Enhancement)
  - Contact admin for clarification

- Admins should:
  - Document rejection reasons (Future Enhancement: Admin Notes field)
  - Communicate with teacher if needed
  - Consider re-reviewing if teacher provides additional credentials

## Best Practices

1. **Regular Reviews**: Check the "Pending Approvals" count daily
2. **Thorough Verification**: Don't rush - verify all information
3. **Consistency**: Apply the same standards to all applicants
4. **Documentation**: Keep notes on why you approved/rejected (manual for now)
5. **Communication**: Reach out to teachers if clarification is needed

## Troubleshooting

### Can't see pending teachers?
- Refresh the page
- Check the "Pending Approvals" count on dashboard
- Verify you're logged in as admin

### Approval button not working?
- Check your internet connection
- Refresh the page and try again
- Check browser console for errors

### Teacher still seeing "Pending" screen after approval?
- Ask teacher to log out and log back in
- Check that the status was actually updated in the database

## Security Note

⚠️ **Only designated admins can approve teachers**. The system checks:
- User email matches admin list
- OR user_type = 'admin' in database
- OR is_admin() function returns true

This ensures only authorized personnel can approve teachers.

---

**Questions or Issues?**
Contact development team or check the admin dashboard for real-time stats and user management.
