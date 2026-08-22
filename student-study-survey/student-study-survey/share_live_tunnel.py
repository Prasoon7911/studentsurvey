import subprocess
import time
import sys
import threading

print("\n" + "="*65)
print(" 🌐 INSTANT LIVE PUBLIC LINK GENERATOR")
print("="*65)
print(" Starting your survey server and creating a live public HTTPS URL...")
print(" Anyone in the world with this link will be able to fill the survey!\n")

def start_server():
    from app import app
    app.run(host="0.0.0.0", port=5000, debug=False)

# Start Flask in background thread
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
time.sleep(1.5)

print(" ✅ Local survey server running on port 5000")
print(" 🔄 Connecting to public tunnel (Pinggy)...")
print("="*65 + "\n")

# Use Windows OpenSSH to create free instant tunnel through Pinggy (no sign-up required)
try:
    cmd = ["ssh", "-p", "443", "-R0:localhost:5000", "a.pinggy.io"]
    subprocess.run(cmd)
except KeyboardInterrupt:
    print("\nTunnel closed.")
except Exception as e:
    print(f"SSH Tunnel note: {e}")
    print("\nAlternative options to make live:")
    print("1. Free 24/7 Hosting: Follow instructions in DEPLOY_GUIDE.md (Render/Railway/Vercel)")
    print("2. Ngrok: Run 'ngrok http 5000'")
