import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { remark } from "remark";
import { MergeDataOptions, remarkMergeData } from "./index.js";

describe(remarkMergeData.name, () => {
  it("merges the readme example correctly", async () => {
    const options: MergeDataOptions[] = [
      {
        lang: "some-language",
        data: {
          foo: "bar",
        },
      },
      {
        lang: "some-other-language",
        data: {
          foo: "baz",
        },
      },
    ];

    expect(
      (
        await remark()
          .use(remarkMergeData, options)
          .process(
            await readFile(
              join(import.meta.dirname, "fixtures/readme-example.md"),
            ),
          )
      ).value,
    ).toMatchSnapshot();
  });

  it("merges JSON deeply correctly", async () => {
    const options: MergeDataOptions[] = [
      {
        lang: "json",
        data: {
          globalRootProp: true,
          nested: {
            globalProperty: "global",
            globalArray: [0],
            overwrittenArray: [3, 4, 5],
          },
        },
      },
    ];

    expect(
      (
        await remark()
          .use(remarkMergeData, options)
          .process(
            await readFile(join(import.meta.dirname, "fixtures/json.md")),
          )
      ).value,
    ).toMatchSnapshot();
  });

  it("merges YAML deeply correctly", async () => {
    const options: MergeDataOptions[] = [
      {
        isYaml: true,
        lang: "yaml",
        data: `
globalRootProp: true
nested:
  globalProperty: global
  globalArray:
    - 0
  overwrittenArray:
    - 3
    - 4
    - 5
`,
      },
    ];

    expect(
      (
        await remark()
          .use(remarkMergeData, options)
          .process(
            await readFile(join(import.meta.dirname, "fixtures/yaml.md")),
          )
      ).value,
    ).toMatchSnapshot();
  });

  it("global data doesn't get polluted by merges", async () => {
    const options: MergeDataOptions[] = [
      {
        lang: "json",
        data: {},
      },
    ];

    await remark()
      .use(remarkMergeData, options)
      .process(
        await readFile(join(import.meta.dirname, "fixtures/pollution0.md")),
      );

    expect(
      (
        await remark()
          .use(remarkMergeData, options)
          .process(
            await readFile(join(import.meta.dirname, "fixtures/pollution1.md")),
          )
      ).value,
    ).toMatchSnapshot();
  });

  it("looks for an exact match of the meta data", async () => {
    const options: MergeDataOptions = {
      lang: "json",
      data: {
        sharedProp: true,
      },
      meta: {
        foo: "bar",
        type: "match",
      },
    };

    const noMatchContent = await readFile(
      join(import.meta.dirname, "fixtures/meta-nomatch.md"),
      "utf-8",
    );
    expect(
      (await remark().use(remarkMergeData, options).process(noMatchContent))
        .value,
    ).toEqual(noMatchContent);

    expect(
      (
        await remark()
          .use(remarkMergeData, options)
          .process(
            await readFile(join(import.meta.dirname, "fixtures/meta-match.md")),
          )
      ).value,
    ).toMatchSnapshot();
  });
});
