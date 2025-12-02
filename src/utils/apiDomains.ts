// export const apiDomainConfig: Record<string, Record<string, string>> = {
//   "121.200.49.254": {
//     base: "http://121.200.49.254:30574",
//     fam: "http://121.200.49.254:30594",
//     main: "http://121.200.49.254:30593",
//     bg: "http://121.200.49.254:30511",
//   },
//     "192.168.1.138": {
//     base: "http://192.168.1.138:30574",
//     fam: "http://192.168.1.138:30594",
//     main: "http://192.168.1.138:30593",
//     bg: "http://192.168.1.138:30511",
//   },
//   localhost: {
//     base: "http://121.200.49.254:30574",
//     fam: "http://121.200.49.254:30594",
//     main: "http://121.200.49.254:30593",
//     bg: "http://121.200.49.254:30511",
//   },
// };


export const apiDomainConfig: Record<string, Record<string, string>> = {
  "qa.bannarimill.com": {
    base: "http://usermanagement-api.qa.bannarimill.com",
    fam: "http://fixedasset-api.qa.bannarimill.com",
    main: "http://maintenance-api.qa.bannarimill.com",
    bg: "http://background-api.qa.bannarimill.com",
  },
  localhost: {
    base: "http://usermanagement-api.qa.bannarimill.com",
    fam: "http://fixedasset-api.qa.bannarimill.com",
    main: "http://maintenance-api.qa.bannarimill.com",
    bg: "http://background-api.qa.bannarimill.com",
  },
};