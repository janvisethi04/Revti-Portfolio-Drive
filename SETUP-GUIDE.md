# 🚀 Supabase Setup Guide — Link Manager

## Step 1: Supabase Account & Project Banao

1. Jao 👉 **https://supabase.com** → Sign Up karo
2. `New Project` pe click karo
3. Name do: `link-manager`, password set karo, region choose karo → **Create Project**
4. Thodi der mein project ready ho jayega (1-2 min)

---

## Step 2: Database Table Banao

1. Left sidebar mein **SQL Editor** pe click karo
2. `New Query` pe click karo
3. `supabase-schema.sql` file ka pura content paste karo
4. **Run** karo (Ctrl+Enter)

---

## Step 3: Credentials Copy Karo

1. Left sidebar mein **Settings → API** pe jao
2. Yeh do cheezein copy karo:

| Field | Kahan milega |
|---|---|
| `Project URL` | "Project URL" section |
| `anon public` key | "Project API Keys" section |

---

## Step 4: .env File Mein Fill Karo

Project folder mein `.env` file kholo:

```
C:\Users\JANVI\.gemini\antigravity\scratch\link-manager-react\.env
```

Aur in values ko apni values se replace karo:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your_anon_key...
VITE_APP_PASSWORD=apna_password_yahan_likho
```

---

## Step 5: App Run Karo

Terminal mein yeh commands chalao:

```bash
cd C:\Users\JANVI\.gemini\antigravity\scratch\link-manager-react
npm run dev
```

Browser mein khulega: **http://localhost:5173**

---

## ✅ Sab Done!

- 🔐 Password: jo `.env` mein `VITE_APP_PASSWORD` set kiya
- 💾 Data Supabase database mein save hoga
- 🔄 Realtime: ek tab mein add karo, dusre tab mein auto update hoga
- 🌐 Koi bhi URL kaam karta hai (Google Drive, YouTube, etc.)
