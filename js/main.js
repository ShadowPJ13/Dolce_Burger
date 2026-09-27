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
// Si cambias el horario, actualiza también openingHoursSpecification en index.html.

// Cierres y horarios especiales (festivos, vacaciones) con la fecha en formato AAAA-MM-DD.
// [] = cerrado todo el día; también admite tramos distintos, p. ej. [["12:30", "16:30"]].
const EXCEPCIONES = {
  // "2026-12-25": [],
};

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fmt = (hhmm) => (hhmm === "24:00" ? "00:00" : hhmm);

// Fecha (medianoche UTC del día) y minutos actuales en Barcelona, independientemente de la zona del visitante.
function nowInMadrid() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return { date: Date.UTC(get("year"), get("month") - 1, get("day")), minutes: get("hour") * 60 + get("minute") };
}

const DAY_MS = 86_400_000;
const weekday = (date) => new Date(date).getUTCDay();
const isoDate = (date) => new Date(date).toISOString().slice(0, 10);
const slotsOn = (date) => EXCEPCIONES[isoDate(date)] ?? HOURS[weekday(date)];
const slotsText = (slots) => (slots.length ? slots.map(([a, b]) => `${fmt(a)} – ${fmt(b)}`).join("<br>") : "Cerrado");

function renderHours() {
  const tbody = document.querySelector("#hours-table tbody");
  const { date } = nowInMadrid();
  const today = weekday(date);
  const special = EXCEPCIONES[isoDate(date)];
  tbody.innerHTML = WEEK_ORDER.map((d) => {
    const text = d === today && special
      ? `${slotsText(special)}<br><small>Horario especial hoy</small>`
      : slotsText(HOURS[d]);
    return `<tr class="${d === today ? "is-today" : ""}"><th scope="row">${DAY_NAMES[d]}</th><td>${text}</td></tr>`;
  }).join("");
}

function renderStatus() {
  const el = document.getElementById("open-status");
  const { date, minutes } = nowInMadrid();
  const today = slotsOn(date);
  const current = today.find(([a, b]) => minutes >= toMin(a) && minutes < toMin(b));
  if (current) {
    el.textContent = `Abierto ahora · hasta las ${fmt(current[1])}`;
    el.className = "status is-open";
    return;
  }
  const laterToday = today.find(([a]) => toMin(a) > minutes);
  if (laterToday) {
    el.textContent = `Cerrado ahora · abrimos hoy a las ${laterToday[0]}`;
  } else {
    el.textContent = "Cerrado ahora";
    // Hasta dos semanas vista, por si hay vacaciones
    for (let i = 1; i <= 14; i++) {
      const d = date + i * DAY_MS;
      const slots = slotsOn(d);
      if (slots.length) {
        const when = i === 1 ? "mañana"
          : i < 7 ? `el ${DAY_NAMES[weekday(d)].toLowerCase()}`
          : `el ${new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", timeZone: "UTC" })}`;
        el.textContent = `Cerrado ahora · abrimos ${when} a las ${slots[0][0]}`;
        break;
      }
    }
  }
  el.className = "status is-closed";
}

// Carta desde menu.json
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const price = (p, plus) => (p == null ? "Consultar" : `${plus ? "+" : ""}${p.toFixed(2).replace(".", ",")} €`);

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
  const variants = (it) => (it.variantes && it.variantes.length)
    ? `<p class="dish__variants">${it.variantes.map((v) => `${escapeHtml(v.nombre)} <b>${price(v.precio)}</b>`).join(" · ")}</p>`
    : "";

  // En las categorías con fotos, los platos sin foto llevan un hueco con el logo para no descuadrar la rejilla
  const media = (it) => (it.foto
    ? `<img class="dish__img" src="img/carta/${escapeHtml(it.foto)}" alt="${escapeHtml(it.nombre)}" width="800" height="600" loading="lazy" decoding="async">`
    : '<div class="dish__img dish__img--none" aria-hidden="true"></div>');

  const show = (id) => {
    const cat = cats.find((c) => c.id === id);
    const withPhotos = cat.items.some((it) => it.foto);
    tabs.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.id === id)));
    grid.classList.toggle("menu-grid--compact", Boolean(cat.compacta));
    grid.innerHTML = cat.items.map((it) => `
      <article class="dish${withPhotos ? " dish--media" : ""}">
        ${withPhotos ? media(it) : ""}
        ${it.destacado ? '<span class="badge">Favorita</span>' : ""}
        <div class="dish__top">
          <h3>${escapeHtml(it.nombre)}</h3>
          <span class="dish__price">${price(it.precio, cat.suplemento)}</span>
        </div>
        ${it.desc ? `<p>${escapeHtml(it.desc)}</p>` : ""}
        ${variants(it)}
      </article>`).join("");
  };

  const nota = document.getElementById("menu-note");
  if (nota && data.aviso) nota.textContent = `${data.aviso} Pregunta en el local por alérgenos.`;

  tabs.innerHTML = cats.map((c) =>
    `<button class="tab" type="button" data-id="${c.id}" aria-controls="menu-grid" aria-pressed="false">${escapeHtml(c.nombre)}</button>`).join("");
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (btn) show(btn.dataset.id);
  });
  show(cats[0].id);
}

// Menú móvil
const toggle = document.querySelector(".nav__toggle");
const links = document.getElementById("menu-nav");
const setNav = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  links.classList.toggle("open", open);
};
toggle.addEventListener("click", () => setNav(toggle.getAttribute("aria-expanded") !== "true"));
links.addEventListener("click", (e) => {
  if (e.target.closest("a")) setNav(false);
});

// Mapa: Google Maps instala cookies, así que solo se carga cuando el visitante lo pide
document.getElementById("load-map").addEventListener("click", () => {
  const map = document.getElementById("map");
  map.innerHTML = '<iframe title="Mapa de Dolce Burger" referrerpolicy="no-referrer-when-downgrade" '
    + 'src="https://www.google.com/maps?q=41.3254183,2.0945441&amp;z=17&amp;output=embed"></iframe>';
  map.querySelector("iframe").focus();
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
