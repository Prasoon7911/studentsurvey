/**
 * Student Learning & Study Insights Survey - Wizard Logic
 */

let currentStep = 0; // 0 = login, 1..11 = questions, 12 = thank you
const totalQuestions = 11;

let studentData = {
  student_name: "",
  student_email: ""
};

// Auto-focus first input on load
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("student-name");
  if (nameInput) nameInput.focus();
});

/**
 * Handle Login Submission & Start Survey
 */
function handleLoginSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("student-name").value.trim();
  const email = document.getElementById("student-email").value.trim();

  if (!name || !email) {
    alert("Please fill in both your name and email address.");
    return;
  }

  // Basic email pattern check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  studentData.student_name = name;
  studentData.student_email = email;

  // Move to Question 1
  currentStep = 1;
  updateWizardUI();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Dynamic visibility toggles
 */
function toggleQ1Other(isAbove) {
  const box = document.getElementById("q1-other-box");
  const input = document.getElementById("q1_class_other");
  if (isAbove) {
    box.classList.remove("hidden");
    input.focus();
  } else {
    box.classList.add("hidden");
    input.value = "";
  }
}

function toggleQ2Other(isChecked) {
  const box = document.getElementById("q2-other-box");
  const input = document.getElementById("q2_subject_other");
  if (isChecked) {
    box.classList.remove("hidden");
    input.focus();
  } else {
    box.classList.add("hidden");
    input.value = "";
  }
}

function toggleQ4Other(isChecked) {
  const box = document.getElementById("q4-other-box");
  const input = document.getElementById("q4_other_action");
  if (isChecked) {
    box.classList.remove("hidden");
    input.focus();
  } else {
    box.classList.add("hidden");
    input.value = "";
  }
}

function toggleQ6Other(isOther) {
  const box = document.getElementById("q6-other-box");
  const input = document.getElementById("q6_other_explanation");
  if (isOther) {
    box.classList.remove("hidden");
    input.focus();
  } else {
    box.classList.add("hidden");
    input.value = "";
  }
}

/**
 * Helper to append quick inspiration tags to textarea
 */
function appendPrompt(fieldId, text) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  if (field.value.trim().length > 0) {
    field.value += " • " + text;
  } else {
    field.value = text;
  }
  field.focus();
}

/**
 * Validate current step before proceeding
 */
function validateStep(step) {
  switch (step) {
    case 1: {
      const q1Selected = document.querySelector('input[name="q1_class"]:checked');
      if (!q1Selected) {
        showError("Please select your class or education level.");
        return false;
      }
      if (q1Selected.value === "Above") {
        const otherVal = document.getElementById("q1_class_other").value.trim();
        if (!otherVal) {
          showError("Please specify your course, degree, or year.");
          document.getElementById("q1_class_other").focus();
          return false;
        }
      }
      return true;
    }
    case 2: {
      const checkedSubjects = document.querySelectorAll('input[name="q2_difficult_subjects"]:checked');
      if (checkedSubjects.length === 0) {
        showError("Please select at least one difficult subject.");
        return false;
      }
      const otherChecked = document.getElementById("subj-other").checked;
      if (otherChecked) {
        const otherVal = document.getElementById("q2_subject_other").value.trim();
        if (!otherVal) {
          showError("Please specify the other subject name.");
          document.getElementById("q2_subject_other").focus();
          return false;
        }
      }
      const whyVal = document.getElementById("q2_why_difficult").value.trim();
      if (!whyVal) {
        showError("Please tell us briefly why you find this subject difficult.");
        document.getElementById("q2_why_difficult").focus();
        return false;
      }
      return true;
    }
    case 3: {
      const val = document.getElementById("q3_biggest_study_problem").value.trim();
      if (!val) {
        showError("Please share what problem you face most while studying.");
        document.getElementById("q3_biggest_study_problem").focus();
        return false;
      }
      return true;
    }
    case 4: {
      const checked = document.querySelectorAll('input[name="q4_when_dont_understand"]:checked');
      if (checked.length === 0) {
        showError("Please select at least one option for what you do when you don't understand a topic.");
        return false;
      }
      const otherChecked = document.getElementById("q4-opt6").checked;
      if (otherChecked) {
        const otherVal = document.getElementById("q4_other_action").value.trim();
        if (!otherVal) {
          showError("Please tell us what else you do.");
          document.getElementById("q4_other_action").focus();
          return false;
        }
      }
      return true;
    }
    case 5: {
      const val = document.getElementById("q5_how_know_weak_topics").value.trim();
      if (!val) {
        showError("Please describe how you know which topics you are weak in.");
        document.getElementById("q5_how_know_weak_topics").focus();
        return false;
      }
      return true;
    }
    case 6: {
      const checked = document.querySelector('input[name="q6_understand_low_marks"]:checked');
      if (!checked) {
        showError("Please select an option for low marks understanding.");
        return false;
      }
      if (checked.value === "Other") {
        const otherVal = document.getElementById("q6_other_explanation").value.trim();
        if (!otherVal) {
          showError("Please explain your experience with marks understanding.");
          document.getElementById("q6_other_explanation").focus();
          return false;
        }
      }
      return true;
    }
    case 7: {
      const val = document.getElementById("q7_teacher_specific_feedback").value.trim();
      if (!val) {
        showError("Please answer whether your teacher tells you what to improve.");
        document.getElementById("q7_teacher_specific_feedback").focus();
        return false;
      }
      return true;
    }
    case 8: {
      const val = document.getElementById("q8_differentiated_homework").value.trim();
      if (!val) {
        showError("Please tell us about homework and practice level in your class.");
        document.getElementById("q8_differentiated_homework").focus();
        return false;
      }
      return true;
    }
    case 9: {
      const val = document.getElementById("q9_one_month_before_exam").value.trim();
      if (!val) {
        showError("Please share what you usually do one month before exams.");
        document.getElementById("q9_one_month_before_exam").focus();
        return false;
      }
      return true;
    }
    case 10: {
      const val = document.getElementById("q10_teacher_improvement_wishlist").value.trim();
      if (!val) {
        showError("Please tell us what you wish teachers could do differently.");
        document.getElementById("q10_teacher_improvement_wishlist").focus();
        return false;
      }
      return true;
    }
    case 11: {
      const checked = document.querySelector('input[name="q11_ai_diagnostic_app_interest"]:checked');
      if (!checked) {
        showError("Please select if you would use a diagnostic study app.");
        return false;
      }
      const whyVal = document.getElementById("q11_why_interest").value.trim();
      if (!whyVal) {
        showError("Please tell us why you would (or wouldn't) use this app.");
        document.getElementById("q11_why_interest").focus();
        return false;
      }
      return true;
    }
    default:
      return true;
  }
}

function showError(msg) {
  // Create a toast notification
  const toast = document.createElement("div");
  toast.className = "fixed bottom-5 right-5 z-50 bg-rose-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all transform translate-y-2 opacity-0";
  toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${msg}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Step Navigation
 */
function nextStep() {
  if (!validateStep(currentStep)) return;

  if (currentStep < totalQuestions) {
    currentStep++;
    updateWizardUI();
    window.scrollTo({ top: 120, behavior: "smooth" });
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateWizardUI();
    window.scrollTo({ top: 120, behavior: "smooth" });
  } else if (currentStep === 1) {
    currentStep = 0;
    updateWizardUI();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Update active slide, progress bar, button visibility
 */
function updateWizardUI() {
  // Hide all slides
  const allSlides = document.querySelectorAll(".step-slide");
  allSlides.forEach(slide => slide.classList.remove("active"));

  const progressWrapper = document.getElementById("survey-progress-wrapper");
  const navWrapper = document.getElementById("wizard-navigation");
  const btnNext = document.getElementById("btn-next");
  const btnSubmit = document.getElementById("btn-submit");

  if (currentStep === 0) {
    // Login screen
    document.getElementById("step-login").classList.add("active");
    progressWrapper.classList.add("hidden");
    navWrapper.classList.add("hidden");
  } else if (currentStep >= 1 && currentStep <= totalQuestions) {
    // Question screens
    const currentSlide = document.getElementById(`step-q${currentStep}`);
    if (currentSlide) currentSlide.classList.add("active");

    progressWrapper.classList.remove("hidden");
    navWrapper.classList.remove("hidden");

    // Update progress counters
    const percent = Math.round((currentStep / totalQuestions) * 100);
    document.getElementById("question-counter").innerText = `Question ${currentStep} of ${totalQuestions}`;
    document.getElementById("progress-percent").innerText = `${percent}% Complete`;
    document.getElementById("progress-bar-fill").style.width = `${percent}%`;

    // Last question shows Submit instead of Next
    if (currentStep === totalQuestions) {
      btnNext.classList.add("hidden");
      btnSubmit.classList.remove("hidden");
    } else {
      btnNext.classList.remove("hidden");
      btnSubmit.classList.add("hidden");
    }
  } else if (currentStep === 12) {
    // Thank you screen
    document.getElementById("step-thankyou").classList.add("active");
    progressWrapper.classList.add("hidden");
    navWrapper.classList.add("hidden");
  }
}

/**
 * Handle Final Survey Submission
 */
async function handleSurveySubmit(e) {
  e.preventDefault();
  if (!validateStep(11)) return;

  const btnSubmit = document.getElementById("btn-submit");
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;

  // Gather form values
  const q1ClassEl = document.querySelector('input[name="q1_class"]:checked');
  const q1_class = q1ClassEl ? q1ClassEl.value : "";
  const q1_class_other = document.getElementById("q1_class_other").value.trim();

  const q2Subjects = Array.from(document.querySelectorAll('input[name="q2_difficult_subjects"]:checked')).map(el => el.value);
  const q2_subject_other = document.getElementById("q2_subject_other").value.trim();
  const q2_why_difficult = document.getElementById("q2_why_difficult").value.trim();

  const q3_biggest_study_problem = document.getElementById("q3_biggest_study_problem").value.trim();

  const q4Actions = Array.from(document.querySelectorAll('input[name="q4_when_dont_understand"]:checked')).map(el => el.value);
  const q4_other_action = document.getElementById("q4_other_action").value.trim();

  const q5_how_know_weak_topics = document.getElementById("q5_how_know_weak_topics").value.trim();

  const q6LowMarksEl = document.querySelector('input[name="q6_understand_low_marks"]:checked');
  const q6_understand_low_marks = q6LowMarksEl ? q6LowMarksEl.value : "";
  const q6_other_explanation = document.getElementById("q6_other_explanation").value.trim();

  const q7_teacher_specific_feedback = document.getElementById("q7_teacher_specific_feedback").value.trim();
  const q8_differentiated_homework = document.getElementById("q8_differentiated_homework").value.trim();
  const q9_one_month_before_exam = document.getElementById("q9_one_month_before_exam").value.trim();
  const q10_teacher_improvement_wishlist = document.getElementById("q10_teacher_improvement_wishlist").value.trim();

  const q11InterestEl = document.querySelector('input[name="q11_ai_diagnostic_app_interest"]:checked');
  const q11_ai_diagnostic_app_interest = q11InterestEl ? q11InterestEl.value : "";
  const q11_why_interest = document.getElementById("q11_why_interest").value.trim();

  const payload = {
    student_name: studentData.student_name,
    student_email: studentData.student_email,
    q1_class,
    q1_class_other,
    q2_difficult_subjects: q2Subjects,
    q2_subject_other,
    q2_why_difficult,
    q3_biggest_study_problem,
    q4_when_dont_understand: q4Actions,
    q4_other_action,
    q5_how_know_weak_topics,
    q6_understand_low_marks,
    q6_other_explanation,
    q7_teacher_specific_feedback,
    q8_differentiated_homework,
    q9_one_month_before_exam,
    q10_teacher_improvement_wishlist,
    q11_ai_diagnostic_app_interest,
    q11_why_interest
  };

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      // Trigger confetti celebration
      triggerConfetti();

      document.getElementById("thankyou-name").innerText = studentData.student_name || "Student";
      document.getElementById("submission-id").innerText = data.id ? `SUB-${data.id}` : "SUCCESS";

      currentStep = 12;
      updateWizardUI();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showError(data.error || "Failed to submit survey.");
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `Submit Responses <i class="fa-solid fa-paper-plane text-xs"></i>`;
    }
  } catch (err) {
    console.error("Submission error:", err);
    showError("Could not connect to server. Please try again.");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `Submit Responses <i class="fa-solid fa-paper-plane text-xs"></i>`;
  }
}

/**
 * Confetti Celebration Effect
 */
function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  }
}

/**
 * Restart survey for another submission
 */
function restartSurvey() {
  document.getElementById("survey-form").reset();
  document.getElementById("login-form").reset();
  toggleQ1Other(false);
  toggleQ2Other(false);
  toggleQ4Other(false);
  toggleQ6Other(false);

  const btnSubmit = document.getElementById("btn-submit");
  btnSubmit.disabled = false;
  btnSubmit.innerHTML = `Submit Responses <i class="fa-solid fa-paper-plane text-xs"></i>`;

  currentStep = 0;
  updateWizardUI();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Allow Enter key navigation on inputs
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    if (currentStep === 0) {
      // Allow default form submission
    } else if (currentStep >= 1 && currentStep < totalQuestions && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      nextStep();
    }
  }
});
