import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/contentScripts/youtube.ts",
    output: {
      file: "build/youtube.js",
      format: "cjs",
    },
    plugins: [typescript()],
  },
  {
    input: "src/settings/index.tsx",
    output: {
      file: "build/pages/settings.js",
      format: "esm",
    },
    plugins: [
      typescript(),
      nodeResolve(),
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
