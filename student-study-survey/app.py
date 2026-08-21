import os
import json
import csv
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, session

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "student_survey_secret_key_2026_xYz987")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
RESPONSES_JSON = os.path.join(DATA_DIR, "responses.json")
RESPONSES_CSV = os.path.join(DATA_DIR, "responses.csv")

ADMIN_PASSCODE = os.environ.get("ADMIN_PASSCODE", "Kushpa45")

os.makedirs(DATA_DIR, exist_ok=True)

CSV_HEADERS = [
    "id",
    "timestamp",
    "student_name",
    "student_email",
    "q1_class",
    "q1_class_other",
    "q2_difficult_subjects",
    "q2_subject_other",
    "q2_why_difficult",
    "q3_biggest_study_problem",
    "q4_when_dont_understand",
    "q4_other_action",
    "q5_how_know_weak_topics",
    "q6_understand_low_marks",
    "q6_other_explanation",
    "q7_teacher_specific_feedback",
    "q8_differentiated_homework",
    "q9_one_month_before_exam",
    "q10_teacher_improvement_wishlist",
    "q11_ai_diagnostic_app_interest",
    "q11_why_interest"
]

def init_storage():
    if not os.path.exists(RESPONSES_JSON):
        with open(RESPONSES_JSON, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)
    
    if not os.path.exists(RESPONSES_CSV):
        with open(RESPONSES_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(CSV_HEADERS)

init_storage()

def read_responses():
    try:
        if os.path.exists(RESPONSES_JSON):
            with open(RESPONSES_JSON, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Error reading JSON responses: {e}")
    return []

def save_response(data):
    responses = read_responses()
    responses.append(data)
    with open(RESPONSES_JSON, "w", encoding="utf-8") as f:
        json.dump(responses, f, indent=2, ensure_ascii=False)
    
    row = [
        data.get("id", ""),
        data.get("timestamp", ""),
        data.get("student_name", ""),
        data.get("student_email", ""),
        data.get("q1_class", ""),
        data.get("q1_class_other", ""),
        ", ".join(data.get("q2_difficult_subjects", [])) if isinstance(data.get("q2_difficult_subjects"), list) else data.get("q2_difficult_subjects", ""),
        data.get("q2_subject_other", ""),
        data.get("q2_why_difficult", ""),
        data.get("q3_biggest_study_problem", ""),
        ", ".join(data.get("q4_when_dont_understand", [])) if isinstance(data.get("q4_when_dont_understand"), list) else data.get("q4_when_dont_understand", ""),
        data.get("q4_other_action", ""),
        data.get("q5_how_know_weak_topics", ""),
        data.get("q6_understand_low_marks", ""),
        data.get("q6_other_explanation", ""),
        data.get("q7_teacher_specific_feedback", ""),
        data.get("q8_differentiated_homework", ""),
        data.get("q9_one_month_before_exam", ""),
        data.get("q10_teacher_improvement_wishlist", ""),
        data.get("q11_ai_diagnostic_app_interest", ""),
        data.get("q11_why_interest", "")
    ]
    with open(RESPONSES_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(row)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/submit", methods=["POST"])
def submit_survey():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data received"}), 400

        name = data.get("student_name", "").strip()
        email = data.get("student_email", "").strip()

        if not name or not email:
            return jsonify({"success": False, "error": "Name and Email are required."}), 400

        record = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "student_name": name,
            "student_email": email,
            "q1_class": data.get("q1_class", ""),
            "q1_class_other": data.get("q1_class_other", ""),
            "q2_difficult_subjects": data.get("q2_difficult_subjects", []),
            "q2_subject_other": data.get("q2_subject_other", ""),
            "q2_why_difficult": data.get("q2_why_difficult", ""),
            "q3_biggest_study_problem": data.get("q3_biggest_study_problem", ""),
            "q4_when_dont_understand": data.get("q4_when_dont_understand", []),
            "q4_other_action": data.get("q4_other_action", ""),
            "q5_how_know_weak_topics": data.get("q5_how_know_weak_topics", ""),
            "q6_understand_low_marks": data.get("q6_understand_low_marks", ""),
            "q6_other_explanation": data.get("q6_other_explanation", ""),
            "q7_teacher_specific_feedback": data.get("q7_teacher_specific_feedback", ""),
            "q8_differentiated_homework": data.get("q8_differentiated_homework", ""),
            "q9_one_month_before_exam": data.get("q9_one_month_before_exam", ""),
            "q10_teacher_improvement_wishlist": data.get("q10_teacher_improvement_wishlist", ""),
            "q11_ai_diagnostic_app_interest": data.get("q11_ai_diagnostic_app_interest", ""),
            "q11_why_interest": data.get("q11_why_interest", "")
        }

        save_response(record)
        return jsonify({"success": True, "message": "Response submitted successfully!", "id": record["id"]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/admin")
def admin_page():
    return render_template("admin.html")

@app.route("/api/admin/auth", methods=["POST"])
def admin_auth():
    data = request.get_json() or {}
    passcode = data.get("passcode", "")
    if passcode == ADMIN_PASSCODE:
        session["admin_logged_in"] = True
        return jsonify({"success": True, "message": "Authentication successful"})
    return jsonify({"success": False, "error": "Incorrect passcode"}), 401

@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.pop("admin_logged_in", None)
    return jsonify({"success": True})

@app.route("/api/admin/data", methods=["GET"])
def admin_data():
    passcode_header = request.headers.get("X-Admin-Passcode")
    if not session.get("admin_logged_in") and passcode_header != ADMIN_PASSCODE:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    responses = read_responses()
    
    total_count = len(responses)
    class_counts = {}
    subject_counts = {}
    doubt_channel_counts = {}
    marks_understanding_counts = {}
    app_interest_counts = {"Yes": 0, "Maybe": 0, "No": 0, "Other": 0}

    for r in responses:
        c = r.get("q1_class") or "Unspecified"
        if c.lower() == "above" and r.get("q1_class_other"):
            c = f"Above ({r.get('q1_class_other')})"
        class_counts[c] = class_counts.get(c, 0) + 1

        subjs = r.get("q2_difficult_subjects") or []
        if isinstance(subjs, str):
            subjs = [subjs]
        for s in subjs:
            if s.lower() == "other" and r.get("q2_subject_other"):
                s = f"Other ({r.get('q2_subject_other')})"
            subject_counts[s] = subject_counts.get(s, 0) + 1

        channels = r.get("q4_when_dont_understand") or []
        if isinstance(channels, str):
            channels = [channels]
        for ch in channels:
            if "something else" in ch.lower() and r.get("q4_other_action"):
                ch = f"Other ({r.get('q4_other_action')})"
            doubt_channel_counts[ch] = doubt_channel_counts.get(ch, 0) + 1

        lm = r.get("q6_understand_low_marks") or "Unspecified"
        if "other" in lm.lower() and r.get("q6_other_explanation"):
            lm = f"Other ({r.get('q6_other_explanation')})"
        marks_understanding_counts[lm] = marks_understanding_counts.get(lm, 0) + 1

        ai_int = (r.get("q11_ai_diagnostic_app_interest") or "").lower()
        if "yes" in ai_int:
            app_interest_counts["Yes"] += 1
        elif "maybe" in ai_int:
            app_interest_counts["Maybe"] += 1
        elif "no" in ai_int:
            app_interest_counts["No"] += 1
        else:
            app_interest_counts["Other"] += 1

    analytics = {
        "total_responses": total_count,
        "class_distribution": class_counts,
        "subject_distribution": subject_counts,
        "doubt_channels": doubt_channel_counts,
        "marks_understanding": marks_understanding_counts,
        "app_interest": app_interest_counts
    }

    return jsonify({
        "success": True,
        "responses": list(reversed(responses)),
        "analytics": analytics
    })

@app.route("/api/admin/export/csv")
def export_csv():
    passcode = request.args.get("passcode")
    if not session.get("admin_logged_in") and passcode != ADMIN_PASSCODE:
        return jsonify({"error": "Unauthorized"}), 401
    
    if os.path.exists(RESPONSES_CSV):
        return send_file(
            RESPONSES_CSV,
            mimetype="text/csv",
            as_attachment=True,
            download_name=f"student_survey_responses_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        )
    return jsonify({"error": "No records found"}), 404

@app.route("/api/admin/export/json")
def export_json():
    passcode = request.args.get("passcode")
    if not session.get("admin_logged_in") and passcode != ADMIN_PASSCODE:
        return jsonify({"error": "Unauthorized"}), 401
    
    if os.path.exists(RESPONSES_JSON):
        return send_file(
            RESPONSES_JSON,
            mimetype="application/json",
            as_attachment=True,
            download_name=f"student_survey_responses_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
    return jsonify({"error": "No records found"}), 404

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("\n" + "="*60)
    print("Student Study Research Survey Server Started!")
    print(f"Student Survey URL: http://localhost:{port}")
    print(f"Researcher Admin Portal: http://localhost:{port}/admin")
    print("="*60 + "\n")
    app.run(host="0.0.0.0", port=port, debug=True)
