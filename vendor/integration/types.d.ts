declare module "astrowind:config" {
  import type {
    SiteConfig,
    I18NConfig,
    MetaDataConfig,
    AppBlogConfig,
    UIConfig,
    PersonalConfig,
    AnalyticsConfig,
    AnnouncementConfig,
  } from "./config";

  export const SITE: SiteConfig;
  export const I18N: I18NConfig;
  export const METADATA: MetaDataConfig;
  export const APP_BLOG: AppBlogConfig;
  export const UI: UIConfig;
  export const PERSONAL: PersonalConfig;
  export const ANALYTICS: AnalyticsConfig;
  export const ANNOUNCEMENT: AnnouncementConfig;
}
