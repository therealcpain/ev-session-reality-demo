# EV Session Reality

**Paste kWh + minutes + idle/session fees → one shareable card:**  
true all-in $ · effective $/kWh · fee stack (energy · time · session · idle) · optional vs typical DCFC callout · calm “check app before plug” tip.

Brand on the surface: **EV Session Reality** only.

Not a ChargePoint / EVgo / Electrify America map clone. Not a roaming API. **Estimates only; networks vary.** User-pasted numbers only — zero network scrape. Seeds are labeled teaching receipts (including public news reconstructions) — never invent live rates.

## Hypothesis

Drivers rant with horror bills ($418 dealer / session-fee stacking). Flip that into a **math-honest share card** from their own session numbers: all-in $, effective $/kWh, and a visible fee stack — without claiming any network is always illegal. Success = group-chat shares + “this matches my receipt” replies during viral bill / road-trip weekends.

## How to test (local)

```bash
cd kb/mde/ev-session-reality
npm run build          # copies assets → dist/
# either open the file:
open index.html        # or dist/index.html
# or serve:
npm start              # http://localhost:4193
```

Manual checklist:

1. Open the page → click **Dealer horror · ~$418** → card shows all-in ~$418, effective $/kWh, 4-segment fee stack, vs DCFC callout, tip footer.
2. Click **ChargePoint · short L2 + service fee** → session fee visible in stack (teaching FAQ shape).
3. Click **Clean DCFC · energy-only** → energy dominates; idle/session near zero.
4. Click **Idle shock · after full** → idle segment dominates effective $/kWh.
5. Paste your own numbers → **Show Session card**.
6. **Copy summary** → clipboard has all-in + effective $/kWh + stack + tip.
7. **Share link** → `#e=` restores the card.
8. **Export PNG** → dark fee-stack card downloads and still reads without the form.
9. Empty / missing kWh → honest status (no invented math).
10. Surface brand is **EV Session Reality** only (no Conglomerate / personal names).

### GitHub Pages

This folder is static-ready. Point Pages at `/` of a dedicated repo (or `/docs` after copying `dist/`), with `index.html` at the site root. Relative paths (`styles.css`, `app.js`) work on project pages.

```bash
npm run build   # optional artifact in dist/
```

Do **not** create the public repo or post from this build step — Steward handles Pages + distro. **No sock accounts.**

## Seed cohort (MVP)

| Seed | Teaching point |
|------|----------------|
| Dealer horror · ~$418 | Drive Sep 1 2026 reconstruction (~44 min, $5/kWh + $5/min) — labeled teaching, not live scrape |
| ChargePoint · short L2 + service fee | FAQ service-fee shape on small energy $ (Jun 2026 FAQ cites) |
| Clean DCFC · energy-only | Low stack · energy dominates |
| Idle shock · after full | Idle $ dwarfs energy on a short top-up |
| Guest DC · session fee stack | Guest DC session-fee shape from public ChargePoint FAQ |

Seeds are **labeled teaching receipts**, not live network rates.

## Public cites (hardcoded)

| Source | URL |
|--------|-----|
| ChargePoint Service Fee FAQ (updated Jun 16 2026) | https://www.chargepoint.com/drivers/support/faqs/what-service-fee |
| ChargePoint pricing policies FAQ | https://www.chargepoint.com/drivers/support/faqs/what-are-pricing-policies-and-fees-i-should-be-aware |
| The Drive · $418 dealer bill (Sep 1 2026) | https://www.thedrive.com/news/ev-renter-hit-with-418-charging-bill-after-using-dealers-public-charger |
| Electrek follow-up (Sep 5 2026) | https://electrek.co/2026/09/05/when-public-charging-stations-arent-so-public-and-why-it-matters/ |

Never invent network rate tables. Never claim a pasted session is illegal.

## Ads pathway (ad-only free utility — do not spend yet)

| Path | Notes |
|------|--------|
| **Revenue (primary)** | **AdSense / display under the card + “how EV session fees stack” explainer** (not inside the PNG). Inventory spikes on viral bill days / road-trip weekends. Justified when sessions cover hosting. Free card forever — **no paywall**, no Gumroad. |
| **Brand-safe** | Informational math + public FAQ / news cites. **Estimates only; networks vary.** Ads **not** inside PNG. Never charger-network affiliate that conflicts with honesty brand. |
| **Sponsorship (later)** | Optional brand-safe “how to read charger pricing” only at scale. |
| **Acquisition (gated)** | Google “ChargePoint service fee” / “EV charger $5 per kWh” + Reddit promo only around news recirculation. Creative = “Paste your session — true all-in + $/kWh”. Max CPA abort ~$0.35–0.60 without a completed share. Debit/cash only. **Spend only after one organic viral-bill weekend.** |
| **UTM** | Example: `?utm_source=reddit&utm_medium=organic&utm_campaign=ev_session_mvp` |
| **Tracking** | Card gens + share clicks (GoatCounter path when Pages is live). |
| **Abort sketch** | Pause paid if CPA exceeds band without share / “matches my receipt” replies. |

**No spend from this ready_for_pages step.** Ads are the monetization path (**ad-only OK**).

## Product constraints

- Single static site (no backend).
- **Numbers only from user paste** (or labeled seeds). Never invent live network rates.
- Brand: **EV Session Reality** only on surface.
- Disclaimer always on: estimates only; networks vary.
- Share = URL hash + PNG + copy summary.
- No ChargePoint / EVgo / EA scrape. No sock outrage accounts.

## Files

| Path | Role |
|------|------|
| `index.html` | App shell (GitHub Pages entry) |
| `app.js` | Session math, seeds, fee-stack card, share hash, PNG |
| `styles.css` | EV Session Reality UI |
| `scripts/build.js` | `npm run build` → `dist/` |
| `package.json` | build / start / preview scripts |

## Opportunity

Internal card: `opp_mobility_ev_session_reality` (mobility / EV track).  
Experiment stub: `institutions/mde/experiments/exp_ev_session_reality.md`.
