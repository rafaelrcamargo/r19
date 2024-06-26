# R19 🏎️

A React 19 "framework" **from scratch**.

> The name was definitely not inspired by F1 cars. :))

> [!IMPORTANT]
>
> This branch contains **horrible** code, this is probably toxic in some way and I wouldn't stay here for long. But this is the place where I store the `100 lines` version of this project. _(Used for entertainment purposes only)_
>
> ```bash
> ❯ wc -l *.ts
>     51 build.ts
>     16 rsc.ts
>     32 ssr.ts
>     99 total
> ```

## Features

This has a lot of cool caveats, like using Bun for most of the internals and _(maybe)_ the first React 19 framework to implement ESM and not a bundler like Webpack to be bundled.

- [x] Bundling
  - [x] TS Support
    - [x] JSX Support
  - [x] Assets (Images, Styles, etc...)
- [x] File-based routing
- [x] RSC (React Server Components)
- [x] RSA (React Server Actions)
- [x] SSR
  - [x] Static export
    - [x] Serve static files for default route states

## Examples

- [x] Simple
  - A basic overview of the features
- [x] Advanced
  - A more complex system with a SQLite database

## Usage

This project uses `react-server-dom-esm` as the "plugin" to integrate with most of the React 19 features.

With all the dependencies set up, you can run the project with:

```bash
bun i && bun dev
```

## License

I don't encourage anyone to use this project in production, **not even close to it**. This is just a fun project where all can learn more about React and its internals.
