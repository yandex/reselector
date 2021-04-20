type Selector = (strings: TemplateStringsArray, ... values: (string | number)[]) => string;

/**
 * Validated selectors
 *
 * @example
 *
 * ```typescript
 * import {select, resolve} from 'reselector'
 * import path from 'path'
 *
 * cosnt {Button, Unexisting} = resolve(path.resolve('./MyComponent'))
 *
 * select`${Button}` // [data-tid="1k2v56"]
 *
 * select`${Unexisting}` // throws an error "reselector: you can't use undefined value in select"
 *
 * select`${() => 'foo'} ${{prop: 'bar'}}` // throws an error "reselector: you can use only primitive values"
 * ```
 */
export const select: Selector & {
    css: Selector;
    xpath: Selector;
};

/**
 * Resolves components selectors by the filepath
 *
 * @example
 *
 * ```typescript
 * import {select, resolve} from 'reselector'
 * import path from 'path'
 *
 * resolve(path.resolve('./MyComponent')) // [data-tid="1k2v56"]
 * ```
 */
type Resolve = (filename: string) => Record<string, string>;

type Resolver = (path: string) => string;

type ResolveBy = (resolver: Resolver) => ((path: string) => Record<string, string>);

interface ResolverConfig {
    name: string;
    getId: (filename: string, name: string, resolve?: Resolve) => string;
    /**
     * A list of babel syntax plugins
     */
    syntaxes: Array<string | [string, object]>;
}
type CreateResolve = (config: ResolverConfig) => {resolve: Resolve, resolveBy: ResolveBy};

export const resolve: Resolve & {resolveBy: ResolveBy, createResolve: CreateResolve};
export const resolveBy: ResolveBy;
