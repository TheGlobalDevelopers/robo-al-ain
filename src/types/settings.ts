export interface IntegrationSettings {
  emailApiKey: string;
  paymentGatewayKey: string;
  smsApiKey: string;
  whatsappApiKey: string;
  webhookUrl: string;
}

export interface DealsSettings {
  headline: string;
  subtitle: string;
  endAtIso?: string;
}

export interface SiteSettings {
  integrations: IntegrationSettings;
  deals: DealsSettings;
}

export const defaultSettings: SiteSettings = {
  integrations: {
    emailApiKey: "",
    paymentGatewayKey: "",
    smsApiKey: "",
    whatsappApiKey: "",
    webhookUrl: "",
  },
  deals: {
    headline: "Hot Daily Deals",
    subtitle: "Fresh offers updated regularly.",
    endAtIso: "",
  },
};
