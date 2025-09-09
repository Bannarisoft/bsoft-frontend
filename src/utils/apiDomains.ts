export const apiDomainConfig: Record<string, Record<string, string>> = {
  cluster: {
    base: "http://usermanagement-service:5174/",
    fam: "http://fixedasset-service:5194/",
    main: "http://background-service:5293/",
    bg: "http://maintenance-service:5011/",
  },
};
