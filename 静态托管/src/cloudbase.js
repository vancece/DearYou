import cloudbaseSDK from "@cloudbase/js-sdk";

export const cloudbase = cloudbaseSDK.init({
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID,
  region: "ap-shanghai",
  accessKey: import.meta.env.VITE_CLOUDBASE_ACCESS_KEY,
});
