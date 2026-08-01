# Kiku Bistro TODO

Last updated: 2026-08-01.

## Google Ads follow-up

- After deploying Google Ads conversion tracking, verify `KIKU Bistro Website Interaction` in Google Ads diagnostics / Tag Assistant, then re-check status and conversion counts after 24-48 hours.
- Review Bistro campaign `KIKU Bistro | Suche lokal` (`campaignId 23977868810`) around 2026-08-15 to 2026-08-16 after the 2026-08-01 daytime schedule expansion. Compare clicks, CPC, conversions and CPA for Wednesday `15:00-17:00`, Thursday-Saturday `15:00-18:00`, and Sunday `15:00-17:00` against the existing morning/evening rows.
- Re-check live Google Search/Maps results after the 2026-06-28 location asset fix: breakfast/Bistro queries in Quedlinburg should show the Bistro location (`KIKU Bistro`, Steinbrücke 2), not the Restaurant location (`KIKU`, Pölle 8).
- Review search terms for possible cross-campaign leakage after the 2026-06-28 negative keyword update. Bistro campaign now has broad negatives for `urlaub`, `jan fribus`, `fine dining`, `fine-dining`, `degustation`, `abendessen`, `dinner`, and `kiku restaurant`; add more only if real spend/search terms confirm leakage.
- Review Google Ads search terms for breakfast/lunch queries, especially `fruehstueck quedlinburg`, `fruehstueck in quedlinburg`, `brunch quedlinburg`, `mittagessen quedlinburg`, and `lunch quedlinburg`.
- Compare new Google Ads clicks/spend with Matomo traffic for `utm_campaign=bistro_search_local`; the full URL suffix was corrected on 2026-08-01, so do not use historical July attribution as a clean comparison baseline.
- Keep `10,00 EUR/day` during the daytime schedule test. Decide later whether to change the budget based on useful search terms, CPC, conversions and CPA.
- Keep exact negatives `[quedlinburg altstadt]`, `[cafe halberstadt]`, `[frühstück thale]`, and `[restaurant halberstadt]`; review real search-term spend before adding broader exclusions.
- Exclude campaign `23979630955` from all KIKU analysis and changes; it belongs to the separate Kreis-VST project.
- If ad strength still shows "poor", add more responsive search ad headline/description variants focused on breakfast, lunch, menu, opening days and central Quedlinburg location.
- Keep Bistro and Restaurant location assets separated: Bistro campaign uses `KIKU Bistro only`; Restaurant campaign uses `KIKU Restaurant only`. Do not restore account-level `all locations` on either campaign unless both ad strategies are redesigned.
- Google Ads website conversion setup is active via one conversion action. Do not create separate labels for `phone`, `email`, `route`, and `menu_pdf` unless the reporting strategy changes.

## Website / analytics

- Google Ads conversion action `KIKU Bistro Website Interaction` tracks high-intent website clicks via `assets/google-ads-conversions.js`: PDF menu, route, phone, and email. Enhanced conversions are not enabled.
- Keep public opening hours aligned everywhere: Monday-Tuesday closed; Wednesday and Sunday 9:30-17:00; Thursday-Saturday 9:30-21:00.
- Keep Google Ads landing URLs tagged through the campaign URL suffix: `utm_source=google&utm_medium=cpc&utm_campaign=bistro_search_local&utm_id={campaignid}&utm_term={keyword}&utm_content={creative}`.
- Do not add KIKU Restaurant to the Bistro Matomo site unless a separate tracking design is explicitly approved. Resmio remains a separate booking service.
- Verify the new Matomo phone goal after production deploy by clicking a public `tel:` link and checking that `Telefon Klick` records future conversions.
- After deploying the AI/search update, verify production `https://kiku-bistro.de/llms.txt` returns 200 and production homepage JSON-LD still parses as Restaurant/Menu/WebSite graph.
- Add a Matomo/analytics review for AI traffic sources and user agents: ChatGPT, Perplexity, Gemini, Copilot, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot and Perplexity-User.
- Do not commit credentials, `.env`, Matomo admin details, KeePassXC data, local databases or private infra notes.
