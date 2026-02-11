export interface IntegrationSettings {
  emailApiKey: string;
  paymentGatewayKey: string;
  smsApiKey: string;
  whatsappApiKey: string;
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
    whatsappApiKey: "",
    webhookUrl: "",
  },
};
