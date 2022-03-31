//import { deepmerge } from "./helpers";

import deepmerge from "deepmerge";

describe("deepmerge", () => {
  it("should add new keys", () => {
    expect(JSON.stringify(deepmerge({ a: 1, b: 2 }, { c: 3, d: 4 }))).toMatch(
      JSON.stringify({ a: 1, b: 2, c: 3, d: 4 })
    );
  });

  it("should replace simple values", () => {
    expect(JSON.stringify(deepmerge({ a: 1, b: 2 }, { a: 3, b: 4 }))).toMatch(
      JSON.stringify({ a: 3, b: 4 })
    );
  });

  it("should do deep merge", () => {
    expect(
      JSON.stringify(deepmerge({ a: 1, b: { c: 3 }, d: 4 }, { b: { k: 21 } }))
    ).toMatch(JSON.stringify({ a: 1, b: { c: 3, k: 21 }, d: 4 }));
  });

  it("should remove undefined values", () => {
    const a = {
      user: {
        displayName: "Shreya Dahal",
        email: "shreyadahal@gmail.com",
      },
      page: "channel",
      pageProps: {
        channelId: "UCdTZsE3OcOEglvIcHFFPjhg",
        channelName: "AR 4789",
        imageUrl:
          "https://yt3.ggpht.com/w8DEl65C9TZw-B3Gxhau4O8r6ZC_KlIq6Sx-I-YOqZOQjsJvH9_4PZAG-BeaCxFBm6beQan7CA0=s176-c-k-c0x00ffffff-no-rj",
      },
    };
    const b = {
      page: "pref",
      pageProps: {
        channelId: undefined,
        channelName: undefined,
        imageUrl: undefined,
      },
    };

    expect(JSON.stringify(deepmerge(a, b))).toMatch(
      JSON.stringify({
        user: {
          displayName: "Shreya Dahal",
          email: "shreyadahal@gmail.com",
        },
        page: "pref",
        pageProps: {},
      })
    );
  });
});
