import { apiDomainConfig } from "./apiDomains";

export const getBaseUrl = (module: string): string => {
  let hostname = "localhost";

  if (typeof window !== "undefined") {
    hostname = window.location.hostname;
  } else {
    hostname = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || "localhost";
  }

  const domainConfig =
    apiDomainConfig[hostname] || apiDomainConfig["localhost"];

  switch (module) {
    case "fam":
      return domainConfig.fam || domainConfig.base || "";
    case "main":
      return domainConfig.main || domainConfig.base || "";
    case "bg":
      return domainConfig.bg || domainConfig.base || "";
    case "party":
      return domainConfig.party || domainConfig.base || "";
    case "inventory":
      return domainConfig.inventory || domainConfig.base || "";
    case "purchase":
      return domainConfig.purchase || domainConfig.base || "";
    case "warehouse":
      return domainConfig.warehouse || domainConfig.base || "";
    default:
      return domainConfig.base || "";
  }
};
