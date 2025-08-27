export const BUILD_INFO = {
  sha: (process.env.VERCEL_GIT_COMMIT_SHA ?? "dev").slice(0,7),
  ts: new Date().toISOString(),
};

