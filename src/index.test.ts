import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { remark } from "remark";
import { MergeDataOptions, remarkMergeData } from "./index.js";

describe(remarkMergeData.name, () => {
  it("merges the readme example correctly", async () => {
    const options: MergeDataOptions = {
      lang: "some-language",
      data: {
        foo: "bar",
        unchanged: 123,
      },
    };

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
    const options: MergeDataOptions = {
      lang: "json",
      data: {
        globalRootProp: true,
        nested: {
          globalProperty: "global",
          globalArray: [0],
          overwrittenArray: [3, 4, 5],
        },
      },
    };

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
    const options: MergeDataOptions = {
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
    };

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

  it("throws if yaml is supposed to be used but data isn't a string", async () => {
    const options: MergeDataOptions = {
      isYaml: true,
      lang: "yaml",
      data: {},
    };

    await expect(async () =>
      remark()
        .use(remarkMergeData, options)
        .process(await readFile(join(import.meta.dirname, "fixtures/yaml.md"))),
    ).rejects.toMatchInlineSnapshot(
      `[Error: If you use YAML, you have to provide YAML code as a string.]`,
    );
  });
});
