# VAULT OS v2.0

Browser-native admin runtime. Auth-protected. Modular. Dark.

## STACK
- Vite (build)
- Vanilla JS ESM (no framework)
- FastAPI (optional backend)

## DEFAULT CREDENTIALS (local mode)
```
username: admin
password: vault2025
```
Change in `src/core/auth.js` → `VALID` constant, or wire to backend.

## DEV
```bash
npm install
npm run dev
```

## PRODUCTION BUILD
```bash
npm run build
# dist/ → deploy to Cloudflare Pages, Netlify, etc.
```

## BACKEND (OPTIONAL — real JWT auth)
```bash
cd backend
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt]
uvicorn main:app --reload
```
Set `VITE_API_URL=http://localhost:8000` in `.env` to activate backend mode.

## ARCHITECTURE
```
boot → auth → router → modules
         ↓
      services (vault, session, storage)
         ↓
       ui (shell, dock, modal, panels)
```

## MODULES
| Module     | Role required |
|------------|---------------|
| lockscreen | public        |
| dashboard  | user          |
| settings   | mod           |
| admin      | admin         |
