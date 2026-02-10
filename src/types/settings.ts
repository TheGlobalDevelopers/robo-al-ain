export interface IntegrationSettings {
  emailApiKey: string;
  paymentGatewayKey: string;
  smsApiKey: string;
  webhookUrl: string;
}

export interface SiteSettings {
  integrations: IntegrationSettings;
}

export const defaultSettings: SiteSettings = {
  integrations: {
    emailApiKey: "",
    paymentGatewayKey: "",
    smsApiKey: "",
    webhookUrl: "",
  },
};
