import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import { isEqual, merge as lodashMerge } from "lodash-es";
import type { Root } from "mdast";
import yaml from "yaml";

export type MergeDataOptions = {
  /**
   * The data that will be merged with the data in the selected code blocks.
   * This is the "base" data. The data in every code block can overwrite the global data specified here.
   */
  data: unknown | string;
  /** The language of the code blocks that should be processed. For more specific filtering, use `meta` in addition. */
  lang: string;

  /** If you use YAML, `data` has to be a string that contains valid YAML. */
  isYaml?: boolean;
  /** By default, lodash's merge is used. */
  merge?: (target: unknown, source: unknown) => unknown;
  /**
   * This can be used to filter by arbitrary metadata key-value pairs.
   * Looks e.g. like this in markdown: ```kroki type=vegalite orientation=horizontal
   * Note: The whole metadata object has to match!
   */
  meta?: Record<string, string>;
  /** By default, `JSON.parse` is used. (`yaml.parse` if YAML is used.) */
  parse?: (data: string) => unknown;
  /** By default, `JSON.stringify` is used. (`yaml.stringify` if YAML is used.) */
  stringify?: (data: unknown) => string;
};

const jsonStringify = (dataToStringify: unknown) => {
  return JSON.stringify(dataToStringify, null, 2);
};

export const remarkMergeData: Plugin<[MergeDataOptions[]], Root> = (
  optionsArray,
) => {
  optionsArray.forEach((options) => {
    const { data, isYaml } = options;
    if (isYaml && typeof data !== "string") {
      throw new Error("If you use YAML, `data` has to be a string.");
    }
  });

  return (tree) => {
    visit(tree, "code", function (node) {
      for (const options of optionsArray) {
        const { data, lang, isYaml, merge, meta, parse, stringify } = options;

        if (node.lang !== lang) {
          continue;
        }

        if (meta) {
          if (!node.meta) {
            continue;
          }
          const nodeMeta = Object.fromEntries(
            node.meta.split(" ").map((entry) => {
              return entry.split("=");
            }) as [string, string][],
          );
          if (!isEqual(nodeMeta, meta)) {
            continue;
          }
        }

        const mergeFunction = merge || lodashMerge;
        const parseFunction =
          parse || isYaml ? (code: string) => yaml.parse(code) : JSON.parse;
        const stringifyFunction =
          stringify || isYaml ? yaml.stringify : jsonStringify;

        const documentData = parseFunction(node.value) as unknown;
        node.value = stringifyFunction(
          mergeFunction(
            {},
            isYaml ? parseFunction(data as string) : data,
            documentData,
          ),
        );
      }
    });
  };
};
