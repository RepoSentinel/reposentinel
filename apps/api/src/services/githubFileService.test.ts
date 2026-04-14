import { describe, it, expect } from "vitest";
import { filterRelevantSourceFiles } from "./githubFileService.js";

describe("githubFileService", () => {
  describe("filterRelevantSourceFiles", () => {
    it("should include TypeScript and JavaScript files", () => {
      const files = [
        "src/index.ts",
        "src/utils.js",
        "src/component.tsx",
        "src/page.jsx",
        "lib/helper.mjs",
        "lib/module.cjs",
      ];
      const result = filterRelevantSourceFiles(files);
      expect(result).toEqual(files);
    });

    it("should exclude test files", () => {
      const files = [
        "src/index.ts",
        "src/index.test.ts",
        "src/index.spec.ts",
        "src/__tests__/index.ts",
        "test/integration.ts",
        "tests/unit.ts",
      ];
      const result = filterRelevantSourceFiles(files);
      expect(result).toEqual(["src/index.ts"]);
    });

    it("should exclude node_modules", () => {
      const files = [
        "src/index.ts",
        "node_modules/package/index.js",
        "packages/lib/node_modules/dep/file.ts",
      ];
      const result = filterRelevantSourceFiles(files);
      expect(result).toEqual(["src/index.ts"]);
    });

    it("should exclude type definition files", () => {
      const files = ["src/index.ts", "src/types.d.ts", "lib/utils.d.ts"];
      const result = filterRelevantSourceFiles(files);
      expect(result).toEqual(["src/index.ts"]);
    });

    it("should exclude non-JS/TS files", () => {
      const files = [
        "src/index.ts",
        "README.md",
        "package.json",
        "styles.css",
        "image.png",
        "pnpm-lock.yaml",
      ];
      const result = filterRelevantSourceFiles(files);
      expect(result).toEqual(["src/index.ts"]);
    });

    it("should handle empty array", () => {
      const result = filterRelevantSourceFiles([]);
      expect(result).toEqual([]);
    });

    it("should handle real PR file list", () => {
      const files = [
        "apps/api/src/routes/githubWebhook.ts",
        "apps/api/src/services/githubFileService.ts",
        "apps/api/src/services/githubFileService.test.ts",
        "packages/shared/src/types.ts",
        "apps/api/package.json",
        "pnpm-lock.yaml",
      ];
      const result = filterRelevantSourceFiles(files);
      expect(result).toEqual([
        "apps/api/src/routes/githubWebhook.ts",
        "apps/api/src/services/githubFileService.ts",
        "packages/shared/src/types.ts",
      ]);
    });
  });
});
