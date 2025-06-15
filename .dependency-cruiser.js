module.exports = {
    forbidden: [
      {
        name: "domain-must-not-depend-on-others",
        comment: "domain層は純粋なビジネスロジックの塊です。他レイヤーに依存してはいけません。",
        from: { path: "^src/domain" },
        to: { path: "^src/(application|infrastructure|framework)" },
        severity: "error"
      },

      {
        name: "application-must-not-depend-on-infra-or-framework",
        comment: "application層はuse caseの中心です。インフラ・UIに依存してはいけません。",
        from: { path: "^src/application" },
        to: { path: "^src/(infrastructure|framework)" },
        severity: "error"
      },

      {
        name: "infrastructure-must-not-depend-on-framework",
        comment: "infrastructure層はDBや外部APIの実装に限定し、UIに依存すべきではありません。",
        from: { path: "^src/infrastructure" },
        to: { path: "^src/framework" },
        severity: "error"
      },

      {
        name: "side-effect-only-in-infra",
        comment: "axiosやprismaなど副作用関数は infrastructureでのみ使用可能",
        severity: "error",
        from: { pathNot: "^src/infrastructure" },
        to: {
          dependencyTypes: ["npm", "core"],
          path: "^(axios|prisma|node-fetch|fs)$"
        }
      },

      {
        name: "no-circular-dependencies",
        severity: "error",
        comment: "循環依存は禁止。ファイル/モジュールは一方向に依存するべき。",
        from: {},
        to: { circular: true }
      },

      {
        name: "entity-outside-aggregate",
        comment: "entities ディレクトリは aggregates 配下にしか置けない",
        severity: "error",
        from: {
          path: "^src/domain/.+/entities/.*\\.ts$",
          pathNot: "^src/domain/.+/aggregates/"
        },
        to: {}                    // Location-only check – no dependency match needed
      },

      {
        name: "domain-service-to-entity",
        comment: "ドメインサービスは集約内の個別エンティティに直接アクセスしてはいけません",
        severity: "error",
        from: { path: "^src/domain/.+/services/.*\\.ts$" },
        to: {
          path: "^src/domain/.+/aggregates/.+/(?!index\\.ts).*\\.ts$",
          pathNot: "^src/domain/.+/aggregates/.+/types\\.ts$"
        }
      },

      /**
       * ✅ framework 層は自由に依存可能
       * Next.jsのAPI Route や React Componentなどは、すべての下位レイヤーに依存してよい。
       */
      // → 故に framework に関してはルールを定義していません。
    ],
    options: {
      doNotFollow: { path: "node_modules" },
      tsConfig: { fileName: "tsconfig.json" }
    }
  }
