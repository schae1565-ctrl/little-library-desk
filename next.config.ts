import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 모든 업무 데이터가 요청 시점의 DB 값이므로 Cache Components 모델은 쓰지 않는다.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
