export interface BrandConfig {
  appName: string;
  tagline: string;
  logoUrl: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  footerText: string;
}

export const defaultBrandConfig: BrandConfig = {
  appName: "AiD",
  tagline: "Smart Management System",
  logoUrl: "/logo.png",
  theme: {
    primaryColor: "#7c3aed",
    secondaryColor: "#4f46e5",
    accentColor: "#10b981",
  },
  footerText: "Powered by AiD Platform",
};
