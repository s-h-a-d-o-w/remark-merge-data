import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import { isMatch, merge as lodashMerge } from "lodash-es";
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

export const remarkMergeData: Plugin<[MergeDataOptions], Root> = ({
  data,
  lang,
  isYaml,
  merge,
  meta,
  parse,
  stringify,
}) => {
  if (isYaml && typeof data !== "string") {
    throw new Error("If you use YAML, `data` has to be a string.");
  }

  const mergeFunction = merge || lodashMerge;
  // Wrapping yaml.parse is necessary to force the correct type overload
  const parseFunction =
    parse || isYaml ? (code: string) => yaml.parse(code) : JSON.parse;
  const stringifyFunction =
    stringify || isYaml ? yaml.stringify : jsonStringify;
  return (tree) => {
    visit(tree, "code", function (node) {
      if (node.lang && node.lang === lang) {
        if (meta) {
          if (!node.meta) {
            return;
          }
          const nodeMeta = Object.fromEntries(
            node.meta.split(" ").map((entry) => {
              return entry.split("=");
            }) as [string, string][],
          );
          if (!isMatch(nodeMeta, meta)) {
            // No metadata match found.
            return;
          }
        }

        const documentData = parseFunction(node.value) as unknown;
        node.value = stringifyFunction(
          mergeFunction(
            isYaml ? parseFunction(data as string) : data,
            documentData,
          ),
        );
      }
    });
  };
};
