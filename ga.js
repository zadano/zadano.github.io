(function(){
  "use strict";
  const ID = "G-2N6KKM1WET";

  // подгружаем gtag.js асинхронно
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', ID, {
    anonymize_ip: true,
    send_page_view: true
  });
})();
