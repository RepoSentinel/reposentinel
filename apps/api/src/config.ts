import pkg from "../package.json" with { type: "json" };

export const appConfig = {
  name: "MergeSignal API",
  version: pkg.version,
};
