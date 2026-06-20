# Deployment Readiness — Provision

## Backend Deployment (Render)

### Config
- [x] Dockerfile exists at repo root
- [x] .render.yaml exists
- [x] Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [x] Health endpoint: `/health` returns `{"status":"ok"}`

### Required Environment Variables on Render
```
GEMINI_API_KEY=<google_ai_studio_key>
# Optional: GEMINI_API_KEYS=key1,key2  (for rotation)
```

### Verification Steps
1. Push to GitHub main branch
2. Render auto-deploys from Dockerfile
3. Wait for build (2-3 minutes)
4. Test: `curl https://<render-url>/health`
5. Test: `curl https://<render-url>/demo/scenarios`
6. Test: `curl -X POST https://<render-url>/eligibility/check -H "Content-Type: application/json" -d '{"state":"CA","household_size":3,"monthly_gross_income":1800,"has_elderly_or_disabled":false,"monthly_rent":0,"dependent_care_cost":0}'`

### Fallback if Render is Down
- Run backend locally: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
- Set frontend `.env` to point to local IP: `EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000`
- Demo works identically on LAN

## Frontend Deployment (Expo Go / APK)

### Expo Go (Fastest Demo)
1. `cd frontend && npx expo start`
2. Scan QR code with Expo Go app
3. Phone and computer on same WiFi

### Android APK (Most Reliable Demo)
1. `cd frontend && eas build --platform android --profile preview`
2. Download APK from EAS dashboard
3. Install on phone or share download link

### Required Frontend .env
```
EXPO_PUBLIC_API_BASE_URL=http://<backend-ip-or-url>:8000
# Or Render URL: https://<render-url>
```

## Demo Reliability Tiers

| Tier | Method | Reliability | Setup Time |
|---|---|---|---|
| 1 (Best) | Android APK + Render backend | Highest | 10 min |
| 2 (Good) | Expo Go + Render backend | Good | 2 min |
| 3 (Fallback) | Expo Go + Local backend | Good (LAN only) | 2 min |
| 4 (Emergency) | Screen-recorded walkthrough | Always works | Pre-recorded |

## Pre-Demo Checklist
- [ ] Backend health endpoint responds
- [ ] Gemini key valid (check /health)
- [ ] Expo server running
- [ ] Phone on same WiFi (or APK installed)
- [ ] Demo script open (docs/submission/demo-script.md)
- [ ] Backup: screen recording ready if live demo fails
