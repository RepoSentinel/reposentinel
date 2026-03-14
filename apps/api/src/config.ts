import pkg from "../package.json" with { type: "json" };

export const appConfig = {
  name: "RepoSentinel API",
  version: pkg.version,
};