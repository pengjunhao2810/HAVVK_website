function renderI18nDom(){
    $("[data-i18n]").each(function(){
        const $el = $(this);
        const keyVal = $el.attr("data-i18n");
        if(keyVal.startsWith("[")){
            const match = keyVal.match(/^\[(\w+)\](.+)/);
            if(match){
                const attrName = match[1];
                const transKey = match[2];
                $el.attr(attrName, i18next.t(transKey));
            }
        }else{
            $el.html(i18next.t(keyVal));
        }
    });
}

function htmlFun() {
    $('.yy_ct a').each(function () {
        if ($(this).attr("id") === i18next.language) {
            $(this).addClass('on').siblings().removeClass('on');
            $('.btn_yy span').html($(this).find('span').text());
            $('.yy_box').removeClass('show');
        }
    })
    var url = window.location.href.toLowerCase();
	if (url.indexOf('admin') !== -1) {
	    i18next.language == 'zh'?isEn = false:isEn = true;
		reloadData()
	}
    
}

$(document).ready(function () {
    i18next
  .use(i18nextBrowserLanguageDetector)
  .init({
    supportedLngs: ["zh", "en"],
    nonExplicitSupportedLngs: true,
    fallbackLng: "zh", // en缺失文案兜底中文
    defaultNS: "translation",
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      convertDetectedLanguage: function(lng) {
        // 所有以zh开头 → zh，其余全部映射为en
        return lng.startsWith("zh") ? "zh" : "en";
      }
    },
    resources: (typeof OFFLINE_LANG_RESOURCES !== 'undefined') ? OFFLINE_LANG_RESOURCES : {}
  }, function () {
    function renderAll() {
      renderI18nDom();
      htmlFun();
    }
    renderAll();

    i18next.on("languageChanged", renderAll);
  });

    // 切换按钮
    $('.yy_ct a').click(function () {
        let targetLang = $(this).prop("id");
        $('.btn_yy span').html($(this).find('span').text());
        $(this).addClass('on').siblings().removeClass('on');
        // 点击强制修正中文标识
        if (targetLang.startsWith("zh")) targetLang = "zh";
        i18next.changeLanguage(targetLang);
    });

    $('.btn_yy').click(function () {
        $('.yy_box').toggleClass('show')
    })
});
