import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "rollup-plugin-replace";

export default [
  {
    input: "src/contentScripts/youtube.ts",
    output: {
      file: "build/youtube.js",
      format: "cjs",
    },
    plugins: [nodeResolve(), commonjs(), typescript()],
  },
  {
    input: "src/backgroundScripts/index.ts",
    output: {
      file: "build/background.js",
      format: "esm",
    },
    plugins: [
      nodeResolve(),
      replace({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      }),
      commonjs(),
      typescript(),
    ],
  },
  {
    input: "src/settings/index.tsx",
    output: {
      file: "build/pages/settings.js",
      format: "esm",
    },
    plugins: [
      nodeResolve(),
      replace({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      }),
      commonjs(),
      typescript(),
      copy({
        targets: [
          { src: "src/dist/*", dest: "build" },
          { src: "src/settings/*.(html|css)", dest: "build/pages" },
        ],
        verbose: true,
      }),
    ],
  },
];
