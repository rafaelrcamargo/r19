# R19 🏎️

A React 19 "framework" **from scratch**.

> The name was definitely not inspired by F1 cars. :))

## Features

This has a lot of cool caveats, like using Bun for most of the internals and _(maybe)_ the first React 19 framework to implement ESM and not a bundler like Webpack to be bundled.

- [x] Bundling
  - [x] TS Support
    - [x] JSX Support
  - [x] Assets (Images, Styles, etc...)
- [x] File-based routing
- [x] RSC (React Server Components)
- [x] RSF (React Server Functions)
- [x] SSR
  - [x] Static export _(with `export const dynamic = "force-dynamic"` to opt-out)_
    - [x] Serve static files for default route states

## Examples

- [x] Simple
  - A basic overview of the features
- [x] Advanced
  - A more complex system with a SQLite database

## Usage

This project uses `react-server-dom-esm` as the "plugin" to integrate with most of the React 19 features. But this package is not published yet, so you need to clone the `react` repo and build it yourself.

```bash
git clone https://github.com/facebook/react.git
cd react
yarn && yarn build
```

Then, the `predev` script will copy the necessary files to the `node_modules` folder. _(It expects the `react` repo to be in the same parent directory as this repo.)_

With all the dependencies set up, you can run the project with:

```bash
bun i
bun dev
```

## License

I don't encourage anyone to use this project in production, **not even close to it**. This is just a fun project where all can learn more about React and its internals.
