import os
import socket
import webbrowser
import threading
import time
from app import app

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def open_browser(port):
    time.sleep(1.2)
    webbrowser.open(f"http://localhost:{port}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    local_ip = get_local_ip()

    print("\n" + "="*65)
    print(" STUDENT STUDY INSIGHTS SURVEY WEB APP")
    print("="*65)
    print(f" * Local Browser URL    : http://localhost:{port}")
    print(f" * Mobile/Local Wi-Fi   : http://{local_ip}:{port}")
    print(f" * Researcher Admin     : http://localhost:{port}/admin")
    print("="*65)
    print(" * To share online, see DEPLOY_GUIDE.md or")
    print("   run: python share_live_tunnel.py")
    print("="*65 + "\n")

    # Start browser automatically in background
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()

    app.run(host="0.0.0.0", port=port, debug=False)
