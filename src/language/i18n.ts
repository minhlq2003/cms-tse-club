import i18next, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

export const i18nInstance = i18next.createInstance();

export const initializeI18n = async (locale: string = "vi") => {
  if (!i18nInstance.isInitialized) {
    const [enCommon, viCommon] = await Promise.all([
      import("../../public/locales/en/common.json").then((m) => m.default),
      import("../../public/locales/vi/common.json").then((m) => m.default),
    ]);

    const options: InitOptions = {
      lng: locale,
      fallbackLng: "en",
      ns: ["common"],
      defaultNS: "common",
      resources: {
        en: { common: enCommon },
        vi: { common: viCommon },
      },
      interpolation: { escapeValue: false },
    };
    await i18nInstance.use(initReactI18next).init(options);
  }
};
