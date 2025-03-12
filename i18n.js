import i18n from "i18next";

i18n.init({
  fallbackLng: "en",
  supportedLngs: ["en", "pl"],
  resources: {
    en: {
      translation: {
        ApiKey: "API key",
        ApiKeyHelpText: "Read only scoped API key",
        BaseURL: "Page base URL",
        Config: "Links configuration",
        ContentTypes: "Content types",
        EditorKey: "Client Authorisation Key",
        EditorKeyHelpText:
          "Key to view drafts and cache revalidation. It is defined in your application's environment variables",
        Preview: "Live Preview",
        RouteTemplate: "Page route template",
        SaveToPreview: "Save the content to enable preview",
        UrlTemplate: "URL template",
      },
    },
    pl: {
      translation: {
        ApiKey: "Klucz API",
        ApiKeyHelpText: "Klucz tylko do odczytu",
        BaseURL: "Podstawowy adres strony",
        Config: "Konfiguracja linków",
        ContentTypes: "Definicje typu",
        EditorKey: "Klucz autoryzacji klienta",
        EditorKeyHelpText:
          "Klucz umożliwiający podgląd draftów i rewalidacji cache. " +
          "Jest on zdefiniowany w zmiennych środowiskowych Twojej aplikacji",
        Preview: "Podgląd na żywo",
        RouteTemplate: "Szablon ścieżki do strony",
        SaveToPreview: "Zapisz element aby włączyć podgląd",
        UrlTemplate: "Szablon adresu URL",
      },
    },
  },
});

export default i18n;
