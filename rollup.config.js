import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "rollup-plugin-replace";

const commonPlugins = [
  nodeResolve(),
  replace({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env.DEBUG": JSON.stringify(process.env.DEBUG),
  }),
  commonjs(),
  typescript(),
];

export default [
  {
    input: "src/contentScripts/youtube/index.ts",
    output: {
      file: "build/youtube.js",
      format: "cjs",
    },
    plugins: [...commonPlugins],
  },
  {
    input: "src/backgroundScripts/index.ts",
    output: {
      file: "build/background.js",
      format: "esm",
    },
    plugins: [...commonPlugins],
  },
  {
    input: "src/settings/index.tsx",
    output: {
      file: "build/pages/settings.js",
      format: "esm",
    },
    plugins: [
      ...commonPlugins,
      copy({
        targets: [
          { src: "src/dist/*", dest: "build" },
          { src: "src/settings/*.(html|css|png)", dest: "build/pages" },
        ],
        verbose: true,
      }),
    ],
  },
];
