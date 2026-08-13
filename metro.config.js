const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // The filesystem cache is useful while developing native clients, but a
  // containerised production web export must use NativeWind's virtual module.
  forceWriteFileSystem: process.env.NODE_ENV !== "production",
});
