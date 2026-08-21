# 🚀 Complete Deployment & Live Hosting Guide: Student Study Survey

This application is ready to run locally, on your local network/Wi-Fi, or live on the public internet 24/7 for free.

---

## ⚡ Method 1: Instant Public Live URL (No Sign-up Needed)

If you want an instant `https://...` link to share with students right from your computer:

1. Open PowerShell or Command Prompt in `D:\student-study-survey`
2. Run:
   ```bash
   python share_live_tunnel.py
   ```
3. It will generate a live public HTTPS URL (e.g. `https://xyz.a.pinggy.link`) that anyone on mobile or desktop anywhere in the world can open!

---

## 🌐 Method 2: Permanent 24/7 Free Cloud Hosting on Render.com (Recommended)

Render offers free hosting with SSL and custom domains.

### Step 1: Put your project on GitHub
1. Initialize Git in `D:\student-study-survey`:
   ```bash
   cd D:\student-study-survey
   git init
   git add .
   git commit -m "Student study survey web app"
   ```
2. Create a new GitHub repository (e.g., `student-study-survey`) and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/student-study-survey.git
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to [https://render.com](https://render.com) and create a free account.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Render will auto-detect the `render.yaml` / `Procfile`:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Click **Deploy Web Service**.
6. In ~1-2 minutes, you will get your permanent live URL: `https://student-study-survey.onrender.com`!

---

## 💻 Method 3: Run Locally or on your Local Wi-Fi Network

To run the survey on your PC and allow anyone on the same Wi-Fi (phones, tablets, laptops) to access it:

1. Run:
   ```bash
   python run_survey.py
   ```
2. You will see output like:
   ```text
   ✨ Local Browser URL    : http://localhost:5000
   📱 Mobile/Local Wi-Fi   : http://192.168.1.XX:5000
   🔐 Researcher Admin     : http://localhost:5000/admin
   🔑 Admin Passcode       : admin2026
   ```
3. Anyone connected to the same Wi-Fi can open `http://<your-ip>:5000` on their phone to take the survey!

---

## 🔐 Accessing the Researcher Admin Portal

1. Open: `http://localhost:5000/admin` (or `https://YOUR_LIVE_URL/admin`)
2. Enter your private Passcode (Kushpa45)
3. In the dashboard you can:
   - View real-time analytics and charts (Difficult subjects, doubt channels, AI app demand)
   - Search & filter student submissions
   - Click **"View Details"** to read all 11 answers given by any student
   - Click **"Export CSV"** or **"Export JSON"** to download all records directly to your computer!
