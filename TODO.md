# Kiku Bistro TODO

Last updated: 2026-07-02.

## Google Ads follow-up

- Check Bistro campaign `KIKU Bistro | Suche lokal` (`campaignId 23977868810`) between 2026-07-05 and 2026-07-09 after the 2026-07-02 evening schedule test.
- Re-check live Google Search/Maps results after the 2026-06-28 location asset fix: breakfast/Bistro queries in Quedlinburg should show the Bistro location (`KIKU Bistro`, Steinbrücke 2), not the Restaurant location (`KIKU`, Pölle 8).
- Review search terms for possible cross-campaign leakage after the 2026-06-28 negative keyword update. Bistro campaign now has broad negatives for `urlaub`, `jan fribus`, `fine dining`, `fine-dining`, `degustation`, `abendessen`, `dinner`, and `kiku restaurant`; add more only if real spend/search terms confirm leakage.
- Review Google Ads search terms for breakfast/lunch queries, especially `fruehstueck quedlinburg`, `fruehstueck in quedlinburg`, `brunch quedlinburg`, `mittagessen quedlinburg`, and `lunch quedlinburg`.
- Compare Google Ads clicks/spend with Matomo UTM traffic for `utm_campaign=bistro_search_local`.
- Decide whether to keep `10,00 EUR/day` or increase toward `12,00 EUR/day` based on top-of-page visibility, CPC and useful search terms.
- Compare morning schedule rows with the new Tuesday-Saturday `18:00-22:00` breakfast-planning rows before increasing budget.
- If ad strength still shows "poor", add more responsive search ad headline/description variants focused on breakfast, lunch, menu, opening days and central Quedlinburg location.
- Keep Bistro and Restaurant location assets separated: Bistro campaign uses `KIKU Bistro only`; Restaurant campaign uses `KIKU Restaurant only`. Do not restore account-level `all locations` on either campaign unless both ad strategies are redesigned.

## Website / analytics

- Keep public opening hours aligned everywhere: Monday-Tuesday closed; Wednesday and Sunday 9:30-17:00; Thursday-Saturday 9:30-21:00.
- Keep Google Ads landing URLs tagged with `utm_source=google`, `utm_medium=cpc`, and a campaign-specific `utm_campaign`.
- After deploying the AI/search update, verify production `https://kiku-bistro.de/llms.txt` returns 200 and production homepage JSON-LD still parses as Restaurant/Menu/WebSite graph.
- Add a Matomo/analytics review for AI traffic sources and user agents: ChatGPT, Perplexity, Gemini, Copilot, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot and Perplexity-User.
- Do not commit credentials, `.env`, Matomo admin details, KeePassXC data, local databases or private infra notes.
