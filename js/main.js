// Horario: 0 = domingo ... 6 = sábado. Cada tramo en minutos desde medianoche;
// un cierre a las 00:00 se escribe como 24:00.
const HOURS = {
  1: [],
  2: [["19:30", "23:30"]],
  3: [["12:30", "16:30"], ["19:30", "23:30"]],
  4: [["12:30", "16:30"], ["19:30", "23:00"]],
  5: [["12:30", "16:30"], ["19:30", "24:00"]],
  6: [["12:30", "16:30"], ["19:30", "23:30"]],
  0: [["12:30", "16:30"], ["19:30", "23:30"]],
};
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fmt = (hhmm) => (hhmm === "24:00" ? "00:00" : hhmm);

// Hora actual en Barcelona, independientemente de la zona del visitante.
function nowInMadrid() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function renderHours() {
  const tbody = document.querySelector("#hours-table tbody");
  const { day } = nowInMadrid();
  tbody.innerHTML = WEEK_ORDER.map((d) => {
    const slots = HOURS[d];
    const text = slots.length ? slots.map(([a, b]) => `${fmt(a)} – ${fmt(b)}`).join("<br>") : "Cerrado";
    return `<tr class="${d === day ? "is-today" : ""}"><th scope="row">${DAY_NAMES[d]}</th><td>${text}</td></tr>`;
  }).join("");
}

function renderStatus() {
  const el = document.getElementById("open-status");
  const { day, minutes } = nowInMadrid();
  const current = HOURS[day].find(([a, b]) => minutes >= toMin(a) && minutes < toMin(b));
  if (current) {
    el.textContent = `Abierto ahora · hasta las ${fmt(current[1])}`;
    el.className = "status is-open";
    return;
  }
  const laterToday = HOURS[day].find(([a]) => toMin(a) > minutes);
  if (laterToday) {
    el.textContent = `Cerrado ahora · abrimos hoy a las ${laterToday[0]}`;
  } else {
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (HOURS[d].length) {
        const when = i === 1 ? "mañana" : `el ${DAY_NAMES[d].toLowerCase()}`;
        el.textContent = `Cerrado ahora · abrimos ${when} a las ${HOURS[d][0][0]}`;
        break;
      }
    }
  }
  el.className = "status is-closed";
}

// Carta desde menu.json
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const price = (p) => (p == null ? "Consultar" : `${p.toFixed(2).replace(".", ",")} €`);

async function renderMenu() {
  const grid = document.getElementById("menu-grid");
  const tabs = document.getElementById("menu-tabs");
  let data;
  try {
    const res = await fetch("menu.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch {
    grid.innerHTML = '<p class="muted">No se ha podido cargar la carta. Llámanos al <a href="tel:+34930423132">930 42 31 32</a>.</p>';
    return;
  }

  const cats = data.categorias;
  const show = (id) => {
    const cat = cats.find((c) => c.id === id);
    tabs.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.id === id)));
    grid.innerHTML = cat.items.map((it) => `
      <article class="dish">
        ${it.destacado ? '<span class="badge">Favorita</span>' : ""}
        <div class="dish__top">
          <h3>${escapeHtml(it.nombre)}</h3>
          <span class="dish__price">${price(it.precio)}</span>
        </div>
        <p>${escapeHtml(it.desc)}</p>
      </article>`).join("");
  };

  tabs.innerHTML = cats.map((c) =>
    `<button class="tab" role="tab" data-id="${c.id}" aria-controls="menu-grid">${escapeHtml(c.nombre)}</button>`).join("");
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (btn) show(btn.dataset.id);
  });
  show(cats[0].id);
}

// Menú móvil
const toggle = document.querySelector(".nav__toggle");
const links = document.getElementById("menu-nav");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  links.classList.toggle("open", open);
});
links.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("open");
  }
});

// Carta original (imagen)
const dialog = document.getElementById("menu-dialog");
document.getElementById("open-menu-img").addEventListener("click", () => dialog.showModal());
dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

document.getElementById("year").textContent = new Date().getFullYear();
renderHours();
renderStatus();
setInterval(renderStatus, 60_000);
renderMenu();
