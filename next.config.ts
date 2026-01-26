import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ログを減らす
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // 開発時のソースマップ設定
  productionBrowserSourceMaps: false,
  // 存在しないソースマップを無視
  async rewrites() {
    return [
      {
        source: "/styles.css.map",
        destination: "/api/empty",
      },
    ];
  },
};

export default nextConfig;
