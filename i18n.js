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
        Connected: "Live preview connected",
        Connecting: "Live preview connecting",
        Config: "Links configuration",
        ContentTypes: "Content types",
        EditorKey: "Client Authorisation Key",
        EditorKeyHelpText:
          "Key to view drafts and cache revalidation. It is defined in your application's environment variables",
        LivePreviewPermissionDenied:
          "The preview application is running on localhost, but your browser blocked the required access. " +
          "Open the site settings next to the address bar, " +
          "allow the permissions required to connect to localhost, and refresh the preview.",
        LivePreviewUnavailable: "Live preview is unavailable",
        LivePreviewUpdated: "Live preview updated {{time}}",
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
        Connected: "Połączono z podlągem rzeczywistym",
        Connecting: "Łączenie z podlągem rzeczywistym",
        Config: "Konfiguracja linków",
        ContentTypes: "Definicje typu",
        EditorKey: "Klucz autoryzacji klienta",
        EditorKeyHelpText:
          "Klucz umożliwiający podgląd draftów i rewalidacji cache. " +
          "Jest on zdefiniowany w zmiennych środowiskowych Twojej aplikacji",
        LivePreviewPermissionDenied:
          "Aplikacja podglądu działa na localhost, ale przeglądarka zablokowała wymagany dostęp. " +
          "Otwórz ustawienia witryny przy pasku adresu, " +
          "zezwól na uprawnienia wymagane do połączenia z localhostem i odśwież podgląd.",
        LivePreviewUnavailable: "Podgląd jest niedostępny",
        LivePreviewUpdated: "Zaktualizowano podgląd rzeczywisty {{time}}",
        Preview: "Podgląd na żywo",
        RouteTemplate: "Szablon ścieżki do strony",
        SaveToPreview: "Zapisz element aby włączyć podgląd",
        UrlTemplate: "Szablon adresu URL",
      },
    },
  },
});

export default i18n;
