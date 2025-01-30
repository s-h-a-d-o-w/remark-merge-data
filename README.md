[![github actions](https://github.com/s-h-a-d-o-w/remark-merge-data/actions/workflows/ci.yaml/badge.svg)](https://github.com/s-h-a-d-o-w/remark-merge-data/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/remark-merge-data)](https://www.npmjs.com/package/remark-merge-data)

# remark-merge-data

A [remark](https://remark.js.org) plugin that makes it possible to share global configuration for code blocks in markdown that contain either JSON or YAML data (or any other format if you provide your own `parse` and `stringify`), like when e.g. using [kroki](https://github.com/show-docs/remark-kroki).

## Usage

```typescript
import readFileSync from 'node:fs';
import { remark } from 'remark';
import { MergeDataOptions, remarkMergeData } from "remark-merge-data";

const mergeDataOptions: MergeDataOptions[] = [{
  lang: "some-language",
  data: {
    foo: "bar",
  },
}, {
  lang: "some-other-language",
  data: {
    foo: "baz",
  },
}];

remark()
  .use(remarkMergeData, mergeDataOptions)
  .process(readFileSync('example.md', 'utf8'))
  .then(({value}) => console.log(value))
  .catch((error) => console.error(error));
```

## API

```typescript
export type MergeDataOptions = {
  /**
   * The data that will be merged with the data in the selected code blocks.
   * This is the "base" data. The data in every code block can overwrite the global data specified here.
   */
  data: unknown;
  /** The language of the code blocks that should be processed. For more specific filtering, use `meta` in addition. */
  lang: string;

  /** If you use YAML, `data` has to be a string that contains valid YAML. */
  isYaml?: boolean;
  /** By default, lodash's merge is used.  */
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
```

## Thanks

- [@jordemort](https://github.com/jordemort) - for illustrating [how easy customizing things in blogs with remark can be](https://jordemort.dev/blog/remark-all-the-things/).
- [@remcohaszing](https://github.com/remcohaszing) - for inspiring me to publish this plugin and how to structure it. (See his [mermaid plugin](https://github.com/remcohaszing/remark-mermaidjs/tree/main))
