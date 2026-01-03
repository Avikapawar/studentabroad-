# Testing New AI Recommendations System

## Step 1: Make Sure Backend is Running

```bash
cd backend
python app.py
```

You should see:
```
✅ Using JSON University Service
Model trained successfully
* Running on http://127.0.0.1:5000
```

## Step 2: Make Sure Frontend is Running

```bash
cd frontend
npm start
```

You should see:
```
Compiled successfully!
Local: http://localhost:3000
```

## Step 3: Access the New Page

Open your browser and go to:
```
http://localhost:3000/smart-recommendations
```

## Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. You should see: `SmartRecommendationsPage rendering`

## Step 5: Test the Feature

1. The page should show a form with your profile
2. Default values are already filled in
3. Click "🎯 Generate Recommendations" button
4. Watch the console for API calls
5. Should see loading spinner
6. Then see 10 university recommendations

## Troubleshooting

### If page doesn't load:
- Check console for errors
- Verify route is added in App.js
- Try refreshing the page

### If API fails:
- Check backend is running on port 5000
- Check console for CORS errors
- Check backend terminal for errors

### If you see "Failed to generate recommendations":
- Backend might not be running
- Check backend terminal for errors
- Try: `cd backend && python app.py`

## Expected Result

You should see:
1. ✅ Purple gradient page loads
2. ✅ Form with profile fields
3. ✅ Click button shows loading spinner
4. ✅ After 2-5 seconds, see 10 university cards
5. ✅ Each card shows:
   - University name and location
   - Match score (0-100%)
   - Admission probability (0-100%)
   - Ranking, tuition, requirements
   - Reasons for recommendation
   - View Details and Visit Website buttons

## Quick Test Command

Test the API directly:
```bash
cd backend
python test_recommendations_endpoint.py
```

This will test if the backend API is working without the frontend.