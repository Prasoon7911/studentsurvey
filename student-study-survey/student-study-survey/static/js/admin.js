/**
 * Researcher Admin Dashboard Logic
 */

let allResponses = [];
let cachedAnalytics = null;
let currentPasscode = localStorage.getItem("survey_admin_passcode") || "";

document.addEventListener("DOMContentLoaded", () => {
  if (currentPasscode) {
    verifyPasscode(currentPasscode);
  }
});

async function handleAdminLogin(e) {
  e.preventDefault();
  const input = document.getElementById("admin-passcode-input");
  const passcode = input.value.trim();
  if (!passcode) return;

  const btn = document.getElementById("btn-login-submit");
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;

  await verifyPasscode(passcode);
  btn.disabled = false;
  btn.innerHTML = `<i class="fa-solid fa-unlock text-xs"></i> Unlock Dashboard`;
}

async function verifyPasscode(passcode) {
  const errorEl = document.getElementById("auth-error-msg");
  errorEl.classList.add("hidden");

  try {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode })
    });
    const data = await res.json();

    if (data.success) {
      currentPasscode = passcode;
      localStorage.setItem("survey_admin_passcode", passcode);
      
      // Update export buttons href with passcode
      document.getElementById("btn-export-excel").href = `/api/admin/export/excel?passcode=${encodeURIComponent(passcode)}`;
      document.getElementById("btn-print-portrait").href = `/api/admin/print/portrait?passcode=${encodeURIComponent(passcode)}`;
      document.getElementById("btn-export-csv").href = `/api/admin/export/csv?passcode=${encodeURIComponent(passcode)}`;
      document.getElementById("btn-export-json").href = `/api/admin/export/json?passcode=${encodeURIComponent(passcode)}`;

      document.getElementById("auth-modal").classList.add("hidden");
      document.getElementById("dashboard-wrapper").classList.remove("hidden");
      loadDashboardData();
    } else {
      errorEl.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Auth error:", err);
    errorEl.innerText = "Error connecting to server.";
    errorEl.classList.remove("hidden");
  }
}

function handleAdminLogout() {
  localStorage.removeItem("survey_admin_passcode");
  fetch("/api/admin/logout", { method: "POST" });
  window.location.reload();
}

async function loadDashboardData() {
  try {
    const res = await fetch("/api/admin/data", {
      headers: { "X-Admin-Passcode": currentPasscode }
    });
    const data = await res.json();

    if (!data.success) {
      document.getElementById("auth-modal").classList.remove("hidden");
      document.getElementById("dashboard-wrapper").classList.add("hidden");
      return;
    }

    allResponses = data.responses || [];
    cachedAnalytics = data.analytics || {};

    renderKPIs(cachedAnalytics);
    renderCharts(cachedAnalytics);
    populateClassFilter(allResponses);
    renderTable(allResponses);
  } catch (err) {
    console.error("Error loading dashboard data:", err);
  }
}

function renderKPIs(analytics) {
  const total = analytics.total_responses || 0;
  document.getElementById("stat-total").innerText = total;

  // Top difficult subject
  const subjects = analytics.subject_distribution || {};
  let topSubj = "-";
  let topSubjCount = 0;
  for (const [subj, count] of Object.entries(subjects)) {
    if (count > topSubjCount) {
      topSubjCount = count;
      topSubj = subj;
    }
  }
  document.getElementById("stat-top-subject").innerText = topSubj;
  document.getElementById("stat-top-subject-count").innerText = total > 0 ? `${topSubjCount} mentions (${Math.round((topSubjCount/total)*100)}%)` : "0 mentions";

  // Top doubt channel
  const doubts = analytics.doubt_channels || {};
  let topDoubt = "-";
  let topDoubtCount = 0;
  for (const [ch, count] of Object.entries(doubts)) {
    if (count > topDoubtCount) {
      topDoubtCount = count;
      topDoubt = ch;
    }
  }
  document.getElementById("stat-top-doubt").innerText = topDoubt;
  document.getElementById("stat-top-doubt-count").innerText = total > 0 ? `${topDoubtCount} student responses` : "Preferred method";

  // App Interest
  const interest = analytics.app_interest || {};
  const positive = (interest["Yes"] || 0) + (interest["Maybe"] || 0);
  const percent = total > 0 ? Math.round((positive / total) * 100) : 0;
  document.getElementById("stat-app-interest").innerText = `${percent}%`;
}

function renderCharts(analytics) {
  const total = analytics.total_responses || 1;

  // 1. Classes
  const classDiv = document.getElementById("chart-classes");
  const classes = analytics.class_distribution || {};
  if (Object.keys(classes).length === 0) {
    classDiv.innerHTML = `<p class="text-xs text-slate-500">No responses recorded yet.</p>`;
  } else {
    classDiv.innerHTML = Object.entries(classes).map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-300 font-medium">${escapeHtml(name)}</span>
            <span class="text-indigo-400 font-semibold">${count} (${pct}%)</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2">
            <div class="bg-indigo-500 h-2 rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  // 2. Subjects
  const subjDiv = document.getElementById("chart-subjects");
  const subjects = analytics.subject_distribution || {};
  if (Object.keys(subjects).length === 0) {
    subjDiv.innerHTML = `<p class="text-xs text-slate-500">No responses recorded yet.</p>`;
  } else {
    subjDiv.innerHTML = Object.entries(subjects).map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-300 font-medium">${escapeHtml(name)}</span>
            <span class="text-amber-400 font-semibold">${count}</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2">
            <div class="bg-amber-500 h-2 rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  // 3. Doubt Channels
  const doubtDiv = document.getElementById("chart-doubts");
  const doubts = analytics.doubt_channels || {};
  if (Object.keys(doubts).length === 0) {
    doubtDiv.innerHTML = `<p class="text-xs text-slate-500">No responses recorded yet.</p>`;
  } else {
    doubtDiv.innerHTML = Object.entries(doubts).map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-300 font-medium">${escapeHtml(name)}</span>
            <span class="text-sky-400 font-semibold">${count}</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2">
            <div class="bg-sky-500 h-2 rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join("");
  }
}

function populateClassFilter(responses) {
  const select = document.getElementById("filter-class");
  const currentVal = select.value;
  const classes = new Set();

  responses.forEach(r => {
    let c = r.q1_class || "";
    if (c.toLowerCase() === "above" && r.q1_class_other) {
      c = `Above (${r.q1_class_other})`;
    }
    if (c) classes.add(c);
  });

  select.innerHTML = `<option value="">All Classes</option>` + 
    Array.from(classes).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  
  select.value = currentVal;
}

function renderTable(responses) {
  const tbody = document.getElementById("responses-table-body");
  const emptyMsg = document.getElementById("table-empty-msg");

  if (!responses || responses.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.classList.remove("hidden");
    return;
  }

  emptyMsg.classList.add("hidden");
  tbody.innerHTML = responses.map((r, index) => {
    let displayClass = r.q1_class || "N/A";
    if (displayClass.toLowerCase() === "above" && r.q1_class_other) {
      displayClass = `Above (${r.q1_class_other})`;
    }

    let subjs = Array.isArray(r.q2_difficult_subjects) ? r.q2_difficult_subjects : [r.q2_difficult_subjects || "N/A"];
    if (subjs.includes("Other") && r.q2_subject_other) {
      subjs = subjs.map(s => s === "Other" ? `Other: ${r.q2_subject_other}` : s);
    }
    const subjPills = subjs.slice(0, 2).map(s => `<span class="inline-block bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] mr-1 text-slate-300">${escapeHtml(s)}</span>`).join("") + 
      (subjs.length > 2 ? `<span class="text-[10px] text-slate-400">+${subjs.length - 2} more</span>` : "");

    const problemSnippet = (r.q3_biggest_study_problem || "-").length > 45 ? 
      (r.q3_biggest_study_problem || "").substring(0, 45) + "..." : (r.q3_biggest_study_problem || "-");

    let interestBadge = '<span class="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400">N/A</span>';
    const intStr = (r.q11_ai_diagnostic_app_interest || "").toLowerCase();
    if (intStr.includes("yes")) {
      interestBadge = '<span class="px-2 py-0.5 rounded text-[11px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">Yes 🚀</span>';
    } else if (intStr.includes("maybe")) {
      interestBadge = '<span class="px-2 py-0.5 rounded text-[11px] bg-amber-900/60 text-amber-300 border border-amber-700/50">Maybe 🤔</span>';
    } else if (intStr.includes("no")) {
      interestBadge = '<span class="px-2 py-0.5 rounded text-[11px] bg-rose-900/60 text-rose-300 border border-rose-700/50">No ❌</span>';
    }

    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="p-3.5">
          <div class="font-bold text-white">${escapeHtml(r.student_name || "Unknown")}</div>
          <div class="text-[11px] text-slate-400">${escapeHtml(r.student_email || "-")}</div>
        </td>
        <td class="p-3.5 font-medium text-slate-300">${escapeHtml(displayClass)}</td>
        <td class="p-3.5">${subjPills}</td>
        <td class="p-3.5 text-slate-300 max-w-[200px] truncate" title="${escapeHtml(r.q3_biggest_study_problem || '')}">${escapeHtml(problemSnippet)}</td>
        <td class="p-3.5">${interestBadge}</td>
        <td class="p-3.5 text-[11px] text-slate-400 whitespace-nowrap">${escapeHtml(r.timestamp || "-")}</td>
        <td class="p-3.5 text-right">
          <button onclick="openDetailModal(${index})" class="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition">
            View Details
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function filterResponsesTable() {
  const query = document.getElementById("table-search").value.toLowerCase().trim();
  const classFilter = document.getElementById("filter-class").value.toLowerCase();

  const filtered = allResponses.filter(r => {
    let displayClass = (r.q1_class || "").toLowerCase();
    if (displayClass === "above" && r.q1_class_other) {
      displayClass = `above (${r.q1_class_other.toLowerCase()})`;
    }

    const matchesClass = !classFilter || displayClass === classFilter;

    const name = (r.student_name || "").toLowerCase();
    const email = (r.student_email || "").toLowerCase();
    const problem = (r.q3_biggest_study_problem || "").toLowerCase();
    const subjects = Array.isArray(r.q2_difficult_subjects) ? r.q2_difficult_subjects.join(" ").toLowerCase() : (r.q2_difficult_subjects || "").toLowerCase();

    const matchesQuery = !query || name.includes(query) || email.includes(query) || problem.includes(query) || subjects.includes(query) || displayClass.includes(query);

    return matchesClass && matchesQuery;
  });

  renderTable(filtered);
}

function openDetailModal(index) {
  const r = allResponses[index];
  if (!r) return;

  document.getElementById("modal-student-name").innerText = r.student_name || "Unknown Student";
  
  let displayClass = r.q1_class || "Unspecified";
  if (displayClass.toLowerCase() === "above" && r.q1_class_other) {
    displayClass = `Above 12th (${r.q1_class_other})`;
  }
  document.getElementById("modal-student-meta").innerText = `${r.student_email || "No Email"} • ${displayClass} • Submitted at ${r.timestamp || "-"}`;

  let subjs = Array.isArray(r.q2_difficult_subjects) ? r.q2_difficult_subjects.join(", ") : (r.q2_difficult_subjects || "None");
  if (subjs.includes("Other") && r.q2_subject_other) {
    subjs += ` (Other: ${r.q2_subject_other})`;
  }

  let doubts = Array.isArray(r.q4_when_dont_understand) ? r.q4_when_dont_understand.join(", ") : (r.q4_when_dont_understand || "None");
  if (doubts.includes("Something else") && r.q4_other_action) {
    doubts += ` (Other: ${r.q4_other_action})`;
  }

  let marksExp = r.q6_understand_low_marks || "N/A";
  if (marksExp === "Other" && r.q6_other_explanation) {
    marksExp += ` (Details: ${r.q6_other_explanation})`;
  }

  const contentDiv = document.getElementById("modal-content");
  contentDiv.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
        <span class="text-[11px] font-bold text-indigo-400 uppercase">Q1. Class / Grade</span>
        <p class="text-sm font-semibold text-white mt-1">${escapeHtml(displayClass)}</p>
      </div>
      <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
        <span class="text-[11px] font-bold text-amber-400 uppercase">Q2. Most Difficult Subject(s)</span>
        <p class="text-sm font-semibold text-white mt-1">${escapeHtml(subjs)}</p>
      </div>
    </div>

    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
      <span class="text-[11px] font-bold text-slate-400 uppercase">Q2. Why is this subject difficult?</span>
      <p class="text-sm text-slate-200 mt-1 italic leading-relaxed">"${escapeHtml(r.q2_why_difficult || 'No explanation provided')}"</p>
    </div>

    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
      <span class="text-[11px] font-bold text-slate-400 uppercase">Q3. Biggest Problem While Studying</span>
      <p class="text-sm text-slate-200 mt-1 italic leading-relaxed">"${escapeHtml(r.q3_biggest_study_problem || 'No response')}"</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
        <span class="text-[11px] font-bold text-sky-400 uppercase">Q4. When not understanding a topic</span>
        <p class="text-sm text-slate-200 mt-1 font-medium">${escapeHtml(doubts)}</p>
      </div>
      <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
        <span class="text-[11px] font-bold text-emerald-400 uppercase">Q6. Understand Low Marks?</span>
        <p class="text-sm text-slate-200 mt-1 font-medium">${escapeHtml(marksExp)}</p>
      </div>
    </div>

    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
      <span class="text-[11px] font-bold text-slate-400 uppercase">Q5. How do you know which topics you are weak in?</span>
      <p class="text-sm text-slate-200 mt-1 italic leading-relaxed">"${escapeHtml(r.q5_how_know_weak_topics || 'No response')}"</p>
    </div>

    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
      <span class="text-[11px] font-bold text-slate-400 uppercase">Q7. Does teacher tell you exactly what to improve?</span>
      <p class="text-sm text-slate-200 mt-1 italic leading-relaxed">"${escapeHtml(r.q7_teacher_specific_feedback || 'No response')}"</p>
    </div>

    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
      <span class="text-[11px] font-bold text-slate-400 uppercase">Q8. Differentiated / Level-based Homework</span>
      <p class="text-sm text-slate-200 mt-1 italic leading-relaxed">"${escapeHtml(r.q8_differentiated_homework || 'No response')}"</p>
    </div>

    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
      <span class="text-[11px] font-bold text-slate-400 uppercase">Q9. 1 Month Before Exam Strategy</span>
      <p class="text-sm text-slate-200 mt-1 italic leading-relaxed">"${escapeHtml(r.q9_one_month_before_exam || 'No response')}"</p>
    </div>

    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
      <span class="text-[11px] font-bold text-slate-400 uppercase">Q10. Wish Teacher Could Do Differently</span>
      <p class="text-sm text-slate-200 mt-1 italic leading-relaxed">"${escapeHtml(r.q10_teacher_improvement_wishlist || 'No response')}"</p>
    </div>

    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
      <span class="text-[11px] font-bold text-indigo-400 uppercase">Q11. Diagnostic Weakness App Interest & Why</span>
      <div class="flex items-center gap-2 mt-1">
        <span class="font-bold text-white">${escapeHtml(r.q11_ai_diagnostic_app_interest || 'Unspecified')}</span>
      </div>
      <p class="text-sm text-slate-200 mt-2 italic leading-relaxed">"${escapeHtml(r.q11_why_interest || 'No explanation')}"</p>
    </div>
  `;

  document.getElementById("detail-modal").classList.remove("hidden");
}

function closeDetailModal() {
  document.getElementById("detail-modal").classList.add("hidden");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
