# Profile Update Fix

## Issue
Mobile app was getting "Internal Server Error" when trying to save profile changes.

## Root Cause
The mobile app sends address data as a JSON string:
```javascript
formData.append('address', JSON.stringify(userData.address));
```

But the backend controllers expected individual address fields:
```javascript
const { street, city, state, pincode, country } = req.body;
```

## Solution
Updated all three profile controllers to handle both formats:
1. **Farmer Controller** (`backend/controllers/farmerController.js`)
2. **Customer Controller** (`backend/controllers/customerController.js`)
3. **Retailer Controller** (`backend/controllers/retailerController.js`)

### Changes Made

#### 1. Parse Address JSON
```javascript
// Parse address if it's sent as JSON string (from mobile app)
let addressData = {};
if (req.body.address) {
  try {
    addressData = typeof req.body.address === 'string' 
      ? JSON.parse(req.body.address) 
      : req.body.address;
  } catch (e) {
    console.error("Error parsing address:", e);
    addressData = {};
  }
}
```

#### 2. Support Both Formats
```javascript
// Use parsed address data or individual fields
const addressFields = {
  street: addressData.street || req.body.street || '',
  city: addressData.city || req.body.city || '',
  state: addressData.state || req.body.state || '',
  pincode: addressData.pincode || req.body.pincode || '',
  country: addressData.country || req.body.country || 'India',
};
```

#### 3. Better Error Handling
- Added detailed error logging
- Continue without image upload if Cloudinary fails
- Return error details in development mode
- Added `success` field to responses

#### 4. Default Profile Images
Changed from `"https://example.com/default-profile.png"` to:
```javascript
"https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
```

## Files Modified
- ✅ `backend/controllers/farmerController.js`
- ✅ `backend/controllers/customerController.js`
- ✅ `backend/controllers/retailerController.js`

## Testing
After deploying to Vercel, test profile updates:

### Test 1: Update Profile Without Image
```javascript
// Mobile app
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('phone', '1234567890');
formData.append('address', JSON.stringify({
  street: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  country: 'India'
}));
```

### Test 2: Update Profile With Image
```javascript
// Mobile app
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('phone', '1234567890');
formData.append('address', JSON.stringify({...}));
formData.append('profileImage', {
  uri: 'file://...',
  name: 'profile.jpg',
  type: 'image/jpeg'
});
```

## Deployment Steps

### Option 1: Git Push (Recommended)
```bash
cd backend
git add .
git commit -m "fix: Handle JSON address format in profile updates"
git push
```

Vercel will automatically deploy the changes.

### Option 2: Vercel CLI
```bash
cd backend
vercel --prod
```

## Verification
After deployment, check:
1. ✅ Profile updates work without errors
2. ✅ Address fields are saved correctly
3. ✅ Profile images upload to Cloudinary
4. ✅ Changes persist after app restart

## Expected Response
```json
{
  "success": true,
  "message": "Farmer profile updated",
  "farmer": {
    "_id": "...",
    "name": "John Doe",
    "contact": {
      "phone": "1234567890",
      "email": "john@example.com"
    },
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "profileUrl": "https://res.cloudinary.com/..."
  }
}
```

## Status
✅ **Fixed** - Ready for deployment
