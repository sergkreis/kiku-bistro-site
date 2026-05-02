# Matomo Analytics

Production Matomo runs on the Kiku Bistro VPS in `/opt/kiku-matomo`.

Public URL:

```text
https://analytics.kiku-bistro.de/
```

The public site tracks to:

```text
https://analytics.kiku-bistro.de/matomo.php
```

The public JavaScript tracker is loaded from:

```text
https://analytics.kiku-bistro.de/matomo.js
```

Site ID:

```text
1
```

Current privacy mode:

- self-hosted Matomo
- no Matomo tracking cookies on the public site
- browser feature detection disabled
- IP masking is enabled in Matomo config (`ip_address_mask_length = 2`)
- important click events tracked:
  - route planning links
  - email links
  - PDF menu link
  - menu tab clicks

Production nginx exposes Matomo through a dedicated virtual host:

```text
analytics.kiku-bistro.de -> 127.0.0.1:8081 -> kiku-matomo-app
```

The old path redirects to the subdomain:

```text
https://kiku-bistro.de/analytics/ -> https://analytics.kiku-bistro.de/
```

Do not commit production passwords. The production compose file and admin
credentials live only on the server.
