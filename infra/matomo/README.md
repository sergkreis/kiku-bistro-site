# Matomo Analytics

Production Matomo runs on the Kiku Bistro VPS in `/opt/kiku-matomo`.

Public URL:

```text
https://kiku-bistro.de/analytics/
```

The public site tracks to:

```text
/analytics/matomo.php
```

Current privacy mode:

- self-hosted Matomo
- no Matomo tracking cookies on the public site
- browser feature detection disabled
- important click events tracked:
  - route planning links
  - email links
  - PDF menu link
  - menu tab clicks

Do not commit production passwords. The production compose file and admin
credentials live only on the server.
