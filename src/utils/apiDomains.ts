// export const apiDomainConfig: Record<string, Record<string, string>> = {
//   "121.200.49.254": {
//     base: "http://121.200.49.254:30574",
//     fam: "http://121.200.49.254:30594",
//     main: "http://121.200.49.254:30593",
//     bg: "http://121.200.49.254:30511",
//   },

//   localhost: {
//     base: "http://121.200.49.254:30574",
//     fam: "http://121.200.49.254:30594",
//     main: "http://121.200.49.254:30593",
//     bg: "http://121.200.49.254:30511",
//   },
// };

export const apiDomainConfig: Record<string, Record<string, string>> = {
  cluster: {
    base: "http://usermanagement-service:5174",
    fam: "http://fixedasset-service:5194",
    main: "http://background-service:5293",
    bg: "http://maintenance-service:5011",
  },
  localhost: {
    base: "http://localhost:5174",
    fam: "http://localhost:5194",
    main: "http://localhost:5293",
    bg: "http://localhost:5011",
  },
};
