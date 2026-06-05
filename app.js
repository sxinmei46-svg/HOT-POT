const cfg = window.HOTPOT_CONFIG || {};
const dishes = cfg.dishes || [];
const storageKey = "hotpot-party-submissions-v1";
const selected = new Set();
let currentGuest = null;
let db = null;
let firebaseReady = false;

const $ = (id) => document.getElementById(id);

function hasFirebaseConfig() {
  const f = cfg.firebaseConfig || {};
  return Boolean(f.apiKey && f.authDomain && f.projectId && f.appId);
}

async function initFirebase() {
  if (!hasFirebaseConfig()) {
    $("modeLabel").textContent = "本地演示模式";
    $("modeHint").textContent = "数据仅保存在当前浏览器。配置 Firebase 后即可多人在线汇总。";
    return;
  }

  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const { getFirestore, collection, doc, setDoc, getDocs, serverTimestamp } =
      await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");

    const app = initializeApp(cfg.firebaseConfig);
    db = { instance: getFirestore(app), collection, doc, setDoc, getDocs, serverTimestamp };
    firebaseReady = true;
    $("modeLabel").textContent = "云端收集模式";
    $("modeHint").textContent = "已连接 Firebase Firestore，多人提交会统一汇总。";
  } catch (error) {
    console.error(error);
    $("modeLabel").textContent = "Firebase 连接失败，已切换本地模式";
    $("modeHint").textContent = "请检查 config.js 中的 Firebase 配置与 Firestore 规则。";
  }
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[s]));
}

function slugify(str) {
  return encodeURIComponent(str.trim().toLowerCase()).replace(/%/g, "_");
}

function getLocalSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveLocalSubmission(payload) {
  const rows = getLocalSubmissions();
  const index = rows.findIndex((r) => r.guestId === payload.guestId);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  localStorage.setItem(storageKey, JSON.stringify(rows));
}

async function saveSubmission(payload) {
  if (firebaseReady) {
    const ref = db.doc(db.collection(db.instance, "hotpotSubmissions"), payload.guestId);
    await db.setDoc(ref, { ...payload, updatedAt: db.serverTimestamp() }, { merge: true });
  } else {
    saveLocalSubmission({ ...payload, updatedAt: new Date().toISOString() });
  }
}

async function loadSubmissions() {
  if (firebaseReady) {
    const snapshot = await db.getDocs(db.collection(db.instance, "hotpotSubmissions"));
    return snapshot.docs.map((doc) => doc.data());
  }
  return getLocalSubmissions();
}

function setupCategories() {
  const categories = [...new Set(dishes.map((d) => d.category))];
  $("categoryFilter").innerHTML = `<option value="all">全部分类</option>` +
    categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function renderDishes() {
  const q = $("searchInput").value.trim().toLowerCase();
  const cat = $("categoryFilter").value;
  const filtered = dishes.filter((dish) => {
    const matchesCat = cat === "all" || dish.category === cat;
    const matchesSearch = !q || dish.name.toLowerCase().includes(q) || dish.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  $("dishGrid").innerHTML = filtered.map((dish) => {
    const active = selected.has(dish.name) ? "selected" : "";
    return `
      <button class="dish-card ${active}" type="button" data-dish="${escapeHtml(dish.name)}">
        <span class="dish-name">${escapeHtml(dish.name)}</span>
        <span class="dish-meta">${escapeHtml(dish.category)} · ${escapeHtml(dish.unit)}</span>
      </button>`;
  }).join("");

  document.querySelectorAll(".dish-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.dish;
      if (selected.has(name)) selected.delete(name);
      else selected.add(name);
      updateSelectedCount();
      renderDishes();
    });
  });
}

function updateSelectedCount() {
  $("selectedCount").textContent = selected.size;
}

function checkAllowedGuest(name) {
  const allowed = cfg.allowedGuests || [];
  if (!allowed.length) return true;
  return allowed.map((x) => x.trim().toLowerCase()).includes(name.trim().toLowerCase());
}

function buildCounts(submissions) {
  const counts = {};
  dishes.forEach((d) => counts[d.name] = { name: d.name, category: d.category, unit: d.unit, votes: 0 });
  submissions.forEach((s) => {
    (s.choices || []).forEach((name) => {
      if (!counts[name]) counts[name] = { name, category: "其他", unit: "", votes: 0 };
      counts[name].votes += 1;
    });
  });
  return Object.values(counts).sort((a, b) => b.votes - a.votes || a.category.localeCompare(b.category, "zh-CN"));
}

function suggestedQty(item, attendees) {
  if (!item.votes) return "-";
  const ratio = Math.max(item.votes, Math.ceil(attendees * 0.35));
  if (["肉类"].includes(item.category)) return `${Math.max(1, Math.ceil(ratio / 2))} ${item.unit}`;
  if (["锅底蘸料"].includes(item.category)) return `${Math.max(1, Math.ceil(ratio / 5))} ${item.unit}`;
  if (["饮料甜品"].includes(item.category)) return `${Math.max(1, Math.ceil(ratio / 3))} ${item.unit}`;
  return `${Math.max(1, Math.ceil(ratio / 3))} ${item.unit}`;
}

async function renderAdmin() {
  const submissions = await loadSubmissions();
  const attendees = submissions.filter((s) => s.willAttend).length;
  const counts = buildCounts(submissions).filter((x) => x.votes > 0);
  const top = counts[0];

  $("attendeeCount").textContent = attendees;
  $("submissionCount").textContent = submissions.length;
  $("topDish").textContent = top ? `${top.name} (${top.votes})` : "-";

  $("resultsTable").innerHTML = counts.length ? `
    <table>
      <thead><tr><th>菜品</th><th>分类</th><th>票数</th><th>建议采购</th></tr></thead>
      <tbody>
        ${counts.map((r) => `<tr>
          <td>${escapeHtml(r.name)}</td>
          <td>${escapeHtml(r.category)}</td>
          <td>${r.votes}</td>
          <td>${escapeHtml(suggestedQty(r, attendees))}</td>
        </tr>`).join("")}
      </tbody>
    </table>` : `<p class="muted">暂无提交。</p>`;

  $("guestList").innerHTML = submissions.length ? submissions.map((s) => `
    <article class="guest-item">
      <strong>${escapeHtml(s.name)} ${s.willAttend ? "✅" : "❌"}</strong>
      <span>${escapeHtml(s.note || "无备注")}</span>
      <p>${escapeHtml((s.choices || []).join("、") || "未选择菜品")}</p>
    </article>`).join("") : `<p class="muted">暂无来宾提交。</p>`;
}

function downloadCsv(submissions) {
  const rows = [
    ["姓名", "是否参加", "备注", "选择菜品", "更新时间"],
    ...submissions.map((s) => [
      s.name,
      s.willAttend ? "参加" : "不参加",
      s.note || "",
      (s.choices || []).join("、"),
      s.updatedAt || ""
    ])
  ];
  const csv = "\ufeff" + rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hotpot-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function wireEvents() {
  $("guestForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("guestName").value.trim();
    const note = $("guestNote").value.trim();
    if (!checkAllowedGuest(name)) {
      alert("你的姓名不在邀请名单中，请联系主人确认。");
      return;
    }
    currentGuest = {
      name,
      note,
      willAttend: $("willAttend").checked,
      guestId: slugify(name)
    };
    $("pickerPanel").classList.remove("hidden");
    $("welcomeText").textContent = `${name}，请选择你想吃的菜。你可以之后再次用同名登录修改选择。`;
    location.hash = "pickerPanel";
  });

  $("searchInput").addEventListener("input", renderDishes);
  $("categoryFilter").addEventListener("change", renderDishes);

  $("resetBtn").addEventListener("click", () => {
    selected.clear();
    updateSelectedCount();
    renderDishes();
  });

  $("saveBtn").addEventListener("click", async () => {
    if (!currentGuest) return alert("请先登录。");
    const payload = {
      ...currentGuest,
      choices: [...selected],
      updatedAt: new Date().toISOString()
    };
    $("saveBtn").disabled = true;
    $("saveStatus").textContent = "正在提交...";
    try {
      await saveSubmission(payload);
      $("saveStatus").textContent = "已提交！主人可以在汇总页查看。";
    } catch (error) {
      console.error(error);
      $("saveStatus").textContent = "提交失败，请检查网络或 Firebase 配置。";
    } finally {
      $("saveBtn").disabled = false;
    }
  });

  $("adminBtn").addEventListener("click", () => $("adminDialog").showModal());

  $("unlockAdmin").addEventListener("click", async () => {
    if ($("adminPassword").value !== (cfg.hostPassword || "hotpot2026")) {
      alert("密码不正确。");
      return;
    }
    $("adminLogin").classList.add("hidden");
    $("adminContent").classList.remove("hidden");
    await renderAdmin();
  });

  $("exportCsv").addEventListener("click", async () => downloadCsv(await loadSubmissions()));

  $("clearAll").addEventListener("click", async () => {
    if (firebaseReady) {
      alert("云端模式下请到 Firebase 控制台清空数据，避免误删。");
      return;
    }
    if (confirm("确定清空本地提交数据吗？")) {
      localStorage.removeItem(storageKey);
      await renderAdmin();
    }
  });
}

async function init() {
  document.title = cfg.partyTitle ? `${cfg.partyTitle} · 菜式选择` : document.title;
  await initFirebase();
  setupCategories();
  renderDishes();
  wireEvents();
}

init();
