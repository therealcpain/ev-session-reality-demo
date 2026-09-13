/**
 * EV Session Reality — paste kWh + minutes + idle/session fees → all-in $ + effective $/kWh fee-stack card.
 * Brand: EV Session Reality only. User-pasted numbers; no network scrape.
 * Seeds are labeled teaching receipts — never presented as live rates.
 * Estimates only; networks vary.
 */
(function () {
  "use strict";

  const CP_SERVICE =
    "https://www.chargepoint.com/drivers/support/faqs/what-service-fee";
  const CP_POLICIES =
    "https://www.chargepoint.com/drivers/support/faqs/what-are-pricing-policies-and-fees-i-should-be-aware";
  const DRIVE_418 =
    "https://www.thedrive.com/news/ev-renter-hit-with-418-charging-bill-after-using-dealers-public-charger";
  const ELECTREK =
    "https://electrek.co/2026/09/05/when-public-charging-stations-arent-so-public-and-why-it-matters/";

  const TIP_ONE_LINER =
    "Check the app (or sticker) price before you plug — a map pin is not a price guarantee. Estimates only; networks vary.";

  /** Teaching seeds — labeled; not live scrapes. */
  const SEEDS = [
    {
      id: "dealer-418",
      label: "Dealer horror · ~$418",
      sub: "Teaching reconstruction · Drive Sep 1 2026 (~44 min, $5/kWh + $5/min)",
      kwh: 39.6,
      energyMode: "rate",
      rateKwh: 5,
      energyTotal: 0,
      minutes: 44,
      rateMin: 5,
      sessionFee: 0,
      idleFee: 0,
      refDcfc: 0.45,
      network: "Dealer / other",
      sessionLabel: "Teaching · Drive $418 dealer case (Sep 2026)",
    },
    {
      id: "cp-short-l2",
      label: "ChargePoint · short L2 + service fee",
      sub: "Teaching · FAQ service fee on small energy $ (not a live rate table)",
      kwh: 3.2,
      energyMode: "rate",
      rateKwh: 0.32,
      energyTotal: 0,
      minutes: 48,
      rateMin: 0,
      sessionFee: 0.25,
      idleFee: 0,
      refDcfc: "",
      network: "ChargePoint",
      sessionLabel: "Teaching · account AC service fee shape (FAQ Jun 2026)",
    },
    {
      id: "clean-dcfc",
      label: "Clean DCFC · energy-only",
      sub: "Low stack · energy dominates · no session/idle shock",
      kwh: 42,
      energyMode: "rate",
      rateKwh: 0.48,
      energyTotal: 0,
      minutes: 28,
      rateMin: 0,
      sessionFee: 0,
      idleFee: 0,
      refDcfc: 0.45,
      network: "Electrify America",
      sessionLabel: "Teaching · clean energy-only DCFC",
    },
    {
      id: "idle-shock",
      label: "Idle shock · after full",
      sub: "Teaching · idle $ dwarfs energy on a short top-up",
      kwh: 8.5,
      energyMode: "rate",
      rateKwh: 0.52,
      energyTotal: 0,
      minutes: 22,
      rateMin: 0,
      sessionFee: 0,
      idleFee: 18.5,
      refDcfc: 0.5,
      network: "EVgo",
      sessionLabel: "Teaching · idle fee after charge complete",
    },
    {
      id: "guest-dc-session",
      label: "Guest DC · session fee stack",
      sub: "Teaching · guest DC service fee shape from public ChargePoint FAQ",
      kwh: 12,
      energyMode: "rate",
      rateKwh: 0.55,
      energyTotal: 0,
      minutes: 18,
      rateMin: 0,
      sessionFee: 0.99,
      idleFee: 0,
      refDcfc: 0.45,
      network: "ChargePoint",
      sessionLabel: "Teaching · guest DC session fee (FAQ Jun 2026)",
    },
  ];

  const $ = (id) => document.getElementById(id);

  function num(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function money(n) {
    return "$" + n.toFixed(2);
  }

  function money3(n) {
    return "$" + n.toFixed(3);
  }

  function syncEnergyMode() {
    const mode = $("energyMode").value;
    const rateMode = mode === "rate";
    $("rateField").hidden = !rateMode;
    $("energyTotalField").hidden = rateMode;
  }

  function readInputs() {
    return {
      kwh: num($("kwh").value),
      energyMode: $("energyMode").value || "rate",
      rateKwh: num($("rateKwh").value),
      energyTotal: num($("energyTotal").value),
      minutes: num($("minutes").value),
      rateMin: num($("rateMin").value),
      sessionFee: num($("sessionFee").value),
      idleFee: num($("idleFee").value),
      refDcfc: $("refDcfc").value === "" ? null : num($("refDcfc").value),
      network: $("network").value || "Unknown / sticker",
      sessionLabel: ($("sessionLabel").value || "").trim(),
    };
  }

  function applyInputs(p) {
    $("kwh").value = p.kwh;
    $("energyMode").value = p.energyMode || "rate";
    $("rateKwh").value = p.rateKwh;
    $("energyTotal").value = p.energyTotal || "";
    $("minutes").value = p.minutes;
    $("rateMin").value = p.rateMin;
    $("sessionFee").value = p.sessionFee;
    $("idleFee").value = p.idleFee;
    $("refDcfc").value =
      p.refDcfc === "" || p.refDcfc == null ? "" : p.refDcfc;
    $("network").value = p.network;
    $("sessionLabel").value = p.sessionLabel || "";
    syncEnergyMode();
  }

  function compute(input) {
    const energy =
      input.energyMode === "total"
        ? input.energyTotal
        : input.kwh * input.rateKwh;
    const time = input.minutes * input.rateMin;
    const session = input.sessionFee;
    const idle = input.idleFee;
    const allIn = energy + time + session + idle;
    const eff =
      input.kwh > 0 ? allIn / input.kwh : allIn > 0 ? Infinity : 0;
    return { energy, time, session, idle, allIn, eff };
  }

  function encodeHash(input) {
    const ref =
      input.refDcfc == null || input.refDcfc === ""
        ? ""
        : String(input.refDcfc);
    const payload = [
      input.kwh,
      input.energyMode,
      input.rateKwh,
      input.energyTotal,
      input.minutes,
      input.rateMin,
      input.sessionFee,
      input.idleFee,
      ref,
      input.network,
      input.sessionLabel || "",
    ].join("|");
    try {
      return "#e=" + btoa(unescape(encodeURIComponent(payload))).replace(/=+$/, "");
    } catch (_) {
      return "#e=" + encodeURIComponent(payload);
    }
  }

  function decodeHash() {
    const raw = location.hash || "";
    if (!raw.startsWith("#e=")) return null;
    try {
      let decoded;
      try {
        decoded = decodeURIComponent(escape(atob(raw.slice(3))));
      } catch (_) {
        decoded = decodeURIComponent(raw.slice(3));
      }
      const parts = decoded.split("|");
      if (parts.length < 10) return null;
      return {
        kwh: num(parts[0]),
        energyMode: parts[1] === "total" ? "total" : "rate",
        rateKwh: num(parts[2]),
        energyTotal: num(parts[3]),
        minutes: num(parts[4]),
        rateMin: num(parts[5]),
        sessionFee: num(parts[6]),
        idleFee: num(parts[7]),
        refDcfc: parts[8] === "" ? null : num(parts[8]),
        network: parts[9] || "Unknown / sticker",
        sessionLabel: parts[10] || "",
      };
    } catch (_) {
      return null;
    }
  }

  function renderChips() {
    const wrap = $("seedChips");
    wrap.innerHTML = "";
    SEEDS.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.setAttribute("role", "listitem");
      b.innerHTML =
        s.label + '<span class="chip-sub">' + s.sub + "</span>";
      b.addEventListener("click", () => {
        applyInputs(s);
        wrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active");
        renderCard();
        $("status").textContent =
          "Loaded seed · " + s.label + " (teaching receipt — not a live rate).";
      });
      wrap.appendChild(b);
    });
  }

  function renderSources() {
    const links = $("sourceLinks");
    links.innerHTML = "";
    const items = [
      ["ChargePoint Service Fee FAQ", CP_SERVICE],
      ["ChargePoint pricing policies", CP_POLICIES],
      ["The Drive · $418 dealer bill", DRIVE_418],
      ["Electrek · public vs dealer (Sep 2026)", ELECTREK],
    ];
    items.forEach(([label, href]) => {
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = label;
      links.appendChild(a);
    });
  }

  function stackShares(m) {
    const total = m.allIn;
    if (total <= 0) {
      return { energy: 0, time: 0, session: 0, idle: 0 };
    }
    return {
      energy: (m.energy / total) * 100,
      time: (m.time / total) * 100,
      session: (m.session / total) * 100,
      idle: (m.idle / total) * 100,
    };
  }

  function renderCard() {
    const input = readInputs();
    const hasAny =
      input.kwh > 0 ||
      input.energyTotal > 0 ||
      input.minutes > 0 ||
      input.sessionFee > 0 ||
      input.idleFee > 0;

    if (!hasAny) {
      $("status").textContent =
        "Enter kWh (and rates/fees) — or pick a labeled teaching seed.";
      $("cardSection").hidden = true;
      return;
    }

    if (input.kwh <= 0) {
      $("status").textContent =
        "kWh delivered is required for effective $/kWh (paste energy delivered from the app/receipt).";
      $("cardSection").hidden = true;
      return;
    }

    if (input.energyMode === "rate" && input.rateKwh <= 0 && input.sessionFee <= 0 && input.idleFee <= 0 && input.rateMin <= 0) {
      $("status").textContent =
        "Enter an energy rate ($/kWh) and/or time/session/idle fees.";
      $("cardSection").hidden = true;
      return;
    }

    const m = compute(input);
    const shares = stackShares(m);

    $("cardSection").hidden = false;
    const metaBits = [
      input.network,
      input.kwh.toFixed(2) + " kWh",
      input.minutes > 0 ? input.minutes + " min" : null,
      input.sessionLabel || "pasted session",
    ].filter(Boolean);
    $("cardMeta").textContent = metaBits.join(" · ");
    $("sessionHeadline").textContent = "All-in " + money(m.allIn);

    const effText =
      Number.isFinite(m.eff) ? money3(m.eff) + "/kWh" : "—";
    $("effPill").textContent = effText;

    $("allinVal").textContent = money(m.allIn);
    $("allinSub").textContent =
      input.kwh.toFixed(2) +
      " kWh · " +
      (input.minutes > 0 ? input.minutes + " min connected" : "minutes not set");

    $("effVal").textContent = Number.isFinite(m.eff) ? money3(m.eff) : "—";
    $("effSub").textContent =
      "All-in ÷ " + input.kwh.toFixed(2) + " kWh (includes fees)";

    $("segEnergy").style.width = shares.energy + "%";
    $("segTime").style.width = shares.time + "%";
    $("segSession").style.width = shares.session + "%";
    $("segIdle").style.width = shares.idle + "%";
    $("feeStackTotal").textContent = money(m.allIn);

    const energyDetail =
      input.energyMode === "total"
        ? money(m.energy) + " (receipt total)"
        : money(m.energy) +
          " (" +
          input.kwh.toFixed(2) +
          " × " +
          money3(input.rateKwh) +
          ")";
    $("rEnergy").textContent = energyDetail;
    $("rTime").textContent =
      money(m.time) +
      (input.rateMin > 0
        ? " (" + input.minutes + " × " + money(input.rateMin) + "/min)"
        : " (no $/min)");
    $("rSession").textContent = money(m.session);
    $("rIdle").textContent = money(m.idle);

    const vs = $("vsLine");
    if (input.refDcfc != null && input.refDcfc > 0 && Number.isFinite(m.eff)) {
      const mult = m.eff / input.refDcfc;
      vs.hidden = false;
      vs.innerHTML =
        "<strong>vs your typical DCFC ref</strong> (" +
        money3(input.refDcfc) +
        "/kWh): this session is <strong>" +
        mult.toFixed(1) +
        "×</strong> that reference. Reference is your paste — not a live network table.";
    } else {
      vs.hidden = true;
      vs.textContent = "";
    }

    $("tipLine").textContent = TIP_ONE_LINER;
    renderSources();

    const hash = encodeHash(input);
    if (location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
    $("shareUrl").value = location.href.split("#")[0] + hash;
    $("shareBox").hidden = false;

    $("status").textContent =
      "Card ready — all-in " +
      money(m.allIn) +
      " · effective " +
      (Number.isFinite(m.eff) ? money3(m.eff) : "—") +
      "/kWh.";
  }

  function clearAll() {
    $("kwh").value = "";
    $("energyMode").value = "rate";
    $("rateKwh").value = "";
    $("energyTotal").value = "";
    $("minutes").value = "";
    $("rateMin").value = "";
    $("sessionFee").value = "";
    $("idleFee").value = "";
    $("refDcfc").value = "";
    $("network").selectedIndex = 0;
    $("sessionLabel").value = "";
    syncEnergyMode();
    $("cardSection").hidden = true;
    $("shareBox").hidden = true;
    $("status").textContent = "";
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    history.replaceState(null, "", location.pathname + location.search);
  }

  function summaryText() {
    const input = readInputs();
    const m = compute(input);
    const lines = [
      "EV Session Reality",
      (input.sessionLabel || "Session") +
        " · " +
        input.network +
        " · " +
        input.kwh.toFixed(2) +
        " kWh · " +
        input.minutes +
        " min",
      "True all-in: " + money(m.allIn),
      "Effective: " +
        (Number.isFinite(m.eff) ? money3(m.eff) : "—") +
        "/kWh",
      "Stack — energy " +
        money(m.energy) +
        " · time " +
        money(m.time) +
        " · session " +
        money(m.session) +
        " · idle " +
        money(m.idle),
    ];
    if (input.refDcfc != null && input.refDcfc > 0 && Number.isFinite(m.eff)) {
      lines.push(
        "vs your DCFC ref " +
          money3(input.refDcfc) +
          "/kWh → " +
          (m.eff / input.refDcfc).toFixed(1) +
          "× (your paste, not a live table)"
      );
    }
    lines.push(TIP_ONE_LINER);
    lines.push("Estimates only · networks vary · user-pasted numbers");
    return lines.join("\n");
  }

  async function copySummary() {
    if ($("cardSection").hidden) renderCard();
    if ($("cardSection").hidden) return;
    try {
      await navigator.clipboard.writeText(summaryText());
      $("status").textContent = "Summary copied.";
    } catch (_) {
      $("status").textContent = "Copy failed — select text manually.";
    }
  }

  async function shareLink() {
    if ($("cardSection").hidden) renderCard();
    if ($("cardSection").hidden) return;
    const url = $("shareUrl").value || location.href;
    try {
      await navigator.clipboard.writeText(url);
      $("status").textContent = "Share link copied.";
    } catch (_) {
      $("status").textContent = "Copy failed — use the share URL field.";
    }
  }

  async function copyShare() {
    await shareLink();
  }

  function exportPng() {
    if ($("cardSection").hidden) renderCard();
    if ($("cardSection").hidden) return;

    const input = readInputs();
    const m = compute(input);
    const shares = stackShares(m);
    const canvas = $("pngCanvas");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, W, H);
    const g1 = ctx.createRadialGradient(80, 40, 20, 80, 40, 420);
    g1.addColorStop(0, "rgba(90,212,160,0.18)");
    g1.addColorStop(1, "rgba(90,212,160,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    roundRect(ctx, 28, 28, W - 56, H - 56, 18);
    ctx.fillStyle = "#121820";
    ctx.fill();
    ctx.strokeStyle = "#2e3a48";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#5ad4a0";
    ctx.font = "700 14px IBM Plex Sans, sans-serif";
    ctx.fillText("EV SESSION REALITY", 56, 70);

    ctx.fillStyle = "#8b9aab";
    ctx.font = "500 16px IBM Plex Sans, sans-serif";
    const meta =
      input.network +
      " · " +
      input.kwh.toFixed(2) +
      " kWh · " +
      input.minutes +
      " min · " +
      (input.sessionLabel || "pasted session");
    ctx.fillText(meta.slice(0, 78), 56, 96);

    ctx.fillStyle = "#e8eef4";
    ctx.font = "700 28px IBM Plex Sans, sans-serif";
    ctx.fillText("All-in  " + money(m.allIn), 56, 140);

    // Eff pill
    const pillText = Number.isFinite(m.eff) ? money3(m.eff) + "/kWh" : "—";
    ctx.font = "700 14px IBM Plex Mono, monospace";
    const pw = ctx.measureText(pillText).width + 28;
    const px = W - 56 - pw;
    const py = 58;
    roundRect(ctx, px, py, pw, 28, 14);
    ctx.fillStyle = "rgba(240,180,41,0.18)";
    ctx.fill();
    ctx.fillStyle = "#f0b429";
    ctx.fillText(pillText, px + 14, py + 19);

    // Hero boxes
    roundRect(ctx, 56, 168, 380, 120, 12);
    ctx.fillStyle = "#1a222c";
    ctx.fill();
    ctx.fillStyle = "#8b9aab";
    ctx.font = "700 12px IBM Plex Sans, sans-serif";
    ctx.fillText("TRUE ALL-IN $", 76, 198);
    ctx.fillStyle = "#e8eef4";
    ctx.font = "600 42px IBM Plex Mono, monospace";
    ctx.fillText(money(m.allIn), 76, 248);
    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 14px IBM Plex Sans, sans-serif";
    ctx.fillText(
      input.kwh.toFixed(2) + " kWh · " + input.minutes + " min",
      76,
      272
    );

    roundRect(ctx, 456, 168, 388, 120, 12);
    ctx.fillStyle = "rgba(240,180,41,0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(240,180,41,0.4)";
    ctx.stroke();
    ctx.fillStyle = "#8b9aab";
    ctx.font = "700 12px IBM Plex Sans, sans-serif";
    ctx.fillText("EFFECTIVE $/kWh", 476, 198);
    ctx.fillStyle = "#f0b429";
    ctx.font = "600 42px IBM Plex Mono, monospace";
    ctx.fillText(Number.isFinite(m.eff) ? money3(m.eff) : "—", 476, 248);
    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 14px IBM Plex Sans, sans-serif";
    ctx.fillText("All-in ÷ kWh (fees included)", 476, 272);

    // Fee stack bar
    ctx.fillStyle = "#8b9aab";
    ctx.font = "650 13px IBM Plex Sans, sans-serif";
    ctx.fillText("Fee stack (energy · time · session · idle)", 56, 330);
    ctx.fillStyle = "#5ad4a0";
    ctx.font = "600 13px IBM Plex Mono, monospace";
    ctx.fillText(money(m.allIn), W - 56 - 70, 330);

    const barX = 56;
    const barY = 348;
    const barW = W - 112;
    const barH = 32;
    roundRect(ctx, barX, barY, barW, barH, 8);
    ctx.fillStyle = "#1a222c";
    ctx.fill();

    const colors = [
      ["energy", "rgba(90,212,160,0.9)"],
      ["time", "rgba(126,184,232,0.9)"],
      ["session", "rgba(240,180,41,0.95)"],
      ["idle", "rgba(240,113,120,0.95)"],
    ];
    let x = barX;
    colors.forEach(([key, color]) => {
      const w = (shares[key] / 100) * barW;
      if (w <= 0) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, barY, Math.max(1, w), barH);
      x += w;
    });

    // Receipt strip — 4 items
    const rx = [56, 268, 480, 692];
    const labels = ["ENERGY", "TIME", "SESSION", "IDLE"];
    const vals = [
      money(m.energy),
      money(m.time),
      money(m.session),
      money(m.idle),
    ];
    for (let i = 0; i < 4; i++) {
      roundRect(ctx, rx[i], 408, 152, 70, 10);
      ctx.fillStyle = "#1a222c";
      ctx.fill();
      ctx.fillStyle = "#8b9aab";
      ctx.font = "700 11px IBM Plex Sans, sans-serif";
      ctx.fillText(labels[i], rx[i] + 14, 432);
      ctx.fillStyle = "#e8eef4";
      ctx.font = "500 18px IBM Plex Mono, monospace";
      ctx.fillText(vals[i], rx[i] + 14, 460);
    }

    // vs callout
    let tipY = 510;
    if (input.refDcfc != null && input.refDcfc > 0 && Number.isFinite(m.eff)) {
      roundRect(ctx, 56, tipY, W - 112, 52, 12);
      ctx.fillStyle = "rgba(240,180,41,0.1)";
      ctx.fill();
      ctx.strokeStyle = "rgba(240,180,41,0.35)";
      ctx.stroke();
      ctx.fillStyle = "#e8eef4";
      ctx.font = "400 14px IBM Plex Sans, sans-serif";
      const mult = (m.eff / input.refDcfc).toFixed(1);
      ctx.fillText(
        "vs your DCFC ref " +
          money3(input.refDcfc) +
          "/kWh → " +
          mult +
          "×  (your paste — not a live network table)",
        72,
        tipY + 32
      );
      tipY += 68;
    }

    roundRect(ctx, 56, tipY, W - 112, 72, 12);
    ctx.fillStyle = "rgba(126,184,232,0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(126,184,232,0.35)";
    ctx.stroke();
    ctx.fillStyle = "#e8eef4";
    ctx.font = "400 14px IBM Plex Sans, sans-serif";
    wrapText(ctx, TIP_ONE_LINER, 72, tipY + 28, W - 144, 20);

    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 13px IBM Plex Sans, sans-serif";
    ctx.fillText(
      "User-pasted numbers · no scrape · estimates; networks vary · EV Session Reality",
      56,
      H - 48
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        $("status").textContent = "PNG export failed.";
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download =
        "ev-session-" +
        (input.network || "session").toLowerCase().replace(/\s+/g, "-") +
        ".png";
      a.click();
      URL.revokeObjectURL(a.href);
      $("status").textContent = "PNG downloaded.";
    });
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let yy = y;
    for (let n = 0; n < words.length; n++) {
      const test = line + words[n] + " ";
      if (ctx.measureText(test).width > maxWidth && n > 0) {
        ctx.fillText(line, x, yy);
        line = words[n] + " ";
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, yy);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function init() {
    renderChips();
    syncEnergyMode();
    $("energyMode").addEventListener("change", syncEnergyMode);
    $("cardBtn").addEventListener("click", renderCard);
    $("clearBtn").addEventListener("click", clearAll);
    $("copySummary").addEventListener("click", copySummary);
    $("shareBtn").addEventListener("click", shareLink);
    $("copyShare").addEventListener("click", copyShare);
    $("pngBtn").addEventListener("click", exportPng);

    [
      "kwh",
      "energyMode",
      "rateKwh",
      "energyTotal",
      "minutes",
      "rateMin",
      "sessionFee",
      "idleFee",
      "refDcfc",
      "network",
      "sessionLabel",
    ].forEach((id) => {
      const el = $(id);
      el.addEventListener("change", () => {
        if (id === "energyMode") syncEnergyMode();
        if (!$("cardSection").hidden) renderCard();
      });
      if (el.tagName === "INPUT" && el.type !== "checkbox") {
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter") renderCard();
        });
      }
    });

    const decoded = decodeHash();
    if (decoded) {
      applyInputs(decoded);
      renderCard();
      $("status").textContent = "Restored from share link.";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
