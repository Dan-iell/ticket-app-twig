const SESSION_KEY = "ticketapp_session";
const USERS_KEY = "ticketapp_users";
const TICKETS_KEY = "ticketapp_tickets";

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
function setSession(u) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(u));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function toast(msg, type = "info") {
  const el = document.getElementById("toast");
  if (!el) return;
  let icon = "💬";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";
  el.textContent = `${icon}  ${msg}`;
  el.className = "";
  el.style.background =
    type === "success"
      ? "#16a34a"
      : type === "error"
        ? "#dc2626"
        : type === "warning"
          ? "#d97706"
          : "#4f46e5";
  el.classList.add("toast", "show");
  setTimeout(() => el.classList.remove("show"), 2600);
}


const ticketsStore = {
  all() {
    try {
      return JSON.parse(localStorage.getItem(TICKETS_KEY) || "[]");
    } catch {
      return [];
    }
  },
  save(a) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(a));
  },
  find(id) {
    return this.all().find((x) => x.id === id);
  },
  create(t) {
    const errors = {};
    if (!t.title || t.title.trim().length < 3)
      errors.title = "Title is required";
    if (!["open", "in_progress", "closed"].includes(t.status))
      errors.status = "Invalid status";
    if (t.description && t.description.length > 1000)
      errors.description = "Description too long";
    if (Object.keys(errors).length) return { ok: false, errors };
    const arr = this.all();
    arr.unshift({
      id: crypto.randomUUID(),
      title: t.title.trim(),
      status: t.status,
      description: t.description?.trim() || "",
      createdAt: Date.now(),
    });
    this.save(arr);
    return { ok: true };
  },
  update(t) {
    const errors = {};
    if (!t.id) errors.id = "Missing id";
    if (!t.title || t.title.trim().length < 3)
      errors.title = "Title is required";
    if (!["open", "in_progress", "closed"].includes(t.status))
      errors.status = "Invalid status";
    if (Object.keys(errors).length) return { ok: false, errors };
    const arr = this.all().map((x) =>
      x.id === t.id
        ? {
            ...x,
            title: t.title.trim(),
            status: t.status,
            description: (t.description || "").trim(),
          }
        : x
    );
    this.save(arr);
    return { ok: true };
  },
  remove(id) {
    this.save(this.all().filter((x) => x.id !== id));
  },
};

window.ticketApp = {
  toast,
  guard() {
    const s = getSession();
    if (!s || !s.token) {
      setTimeout(
        () => toast("Your session has expired — please log in again.", "error"),
        50
      );
      setTimeout(() => {
        location.href = "/?page=login";
      }, 900);
    }
  },
  logout() {
    clearSession();
    toast("Logged out", "success");
    setTimeout(() => (location.href = "/?page=landing"), 400);
  },
  signup({ name, email, password }) {
    if (!name || !email || !password)
      return { ok: false, msg: "Please fill all fields" };
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    if (users.some((u) => u.email === email))
      return { ok: false, msg: "Email already registered" };
    users.push({ name, email, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { ok: true };
  },
  login({ email, password }) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) return { ok: false, msg: "Invalid credentials" };
    setSession({
      email: user.email,
      name: user.name,
      token: "local-" + Date.now(),
    });
    return { ok: true };
  },
  tickets: ticketsStore,
};
