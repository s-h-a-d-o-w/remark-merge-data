[![github actions](https://github.com/s-h-a-d-o-w/remark-merge-data/actions/workflows/ci.yaml/badge.svg)](https://github.com/s-h-a-d-o-w/remark-merge-data/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/remark-merge-data)](https://www.npmjs.com/package/remark-merge-data)

# remark-merge-data

A [remark](https://remark.js.org) plugin that makes it possible to share global configuration for code blocks in markdown that contain either JSON or YAML data (or any other format if you provide your own `parse` and `stringify`), like when e.g. using [kroki](https://github.com/show-docs/remark-kroki).

## Generic example

Assuming `example.md` contains the following:

````markdown
```some-language
{
  "localProp": true
}
```
```some-other-language
{
  "localProp": true
}
```
````

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

Will log:

````markdown
```some-language
{
  "foo": "bar",
  "localProp": true
}
```
```some-other-language
{
  "foo": "baz",
  "localProp": true
}
```
````

## Practical example

See [this article](https://aop.software/blog/2025-02-17_graphs-in-blogs/#shared-graph-config) for an example where graphs are defined in code blocks. To avoid large amounts of duplicate definitions, everything that can be shared is merged with the data in those code blocks using this plugin.

## API

```typescript
export type MergeDataOptions = (
  | {
      /**
       * The data that will be merged with the data in the selected code blocks.
       * This is the "base" data. The data in every code block can overwrite the global data specified here.
       */
      data: unknown;

      isYaml?: false;
    }
  | {
      data: string;

      isYaml?: true;
    }
) & {
  /** The language of the code blocks that should be processed. For more specific filtering, use `meta` in addition. */
  lang: string;

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
```

## Thanks

- [@jordemort](https://github.com/jordemort) - for illustrating [how easy customizing things in blogs with remark can be](https://jordemort.dev/blog/remark-all-the-things/).
- [@remcohaszing](https://github.com/remcohaszing) - for inspiring me to publish this plugin and how to structure it. (See his [mermaid plugin](https://github.com/remcohaszing/remark-mermaidjs/tree/main))
