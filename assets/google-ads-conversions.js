(function () {
  const GOOGLE_ADS_ID = "AW-11328671562";
  const CONVERSION_SEND_TO = "AW-11328671562/KH47CO3Zus0cEMqe95kq";
  const CONVERSION_VALUE = 1.0;
  const CONVERSION_CURRENCY = "EUR";

  const conversion = {
    sendTo: CONVERSION_SEND_TO,
    value: CONVERSION_VALUE,
    currency: CONVERSION_CURRENCY,
  };

  window.KIKU_GOOGLE_ADS_CONVERSIONS = {
    ...(window.KIKU_GOOGLE_ADS_CONVERSIONS || {}),
    phone: conversion,
    email: conversion,
    route: conversion,
    menu_pdf: conversion,
  };

  const ensureGoogleTag = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    if (!window.__kikuGoogleAdsScriptLoaded) {
      const script = document.createElement("script");
      const firstScript = document.getElementsByTagName("script")[0];
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GOOGLE_ADS_ID);
      firstScript.parentNode.insertBefore(script, firstScript);
      window.__kikuGoogleAdsScriptLoaded = true;
    }

    if (!window.__kikuGoogleAdsConfigured) {
      window.gtag("set", "allow_ad_personalization_signals", false);
      window.gtag("js", new Date());
      window.gtag("config", GOOGLE_ADS_ID, { send_page_view: false });
      window.__kikuGoogleAdsConfigured = true;
    }
  };

  ensureGoogleTag();
})();
