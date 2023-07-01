# Github Versioned Release

Github action for creating versioned github releases containing only the files you want.

The action is typically used on the `release` event and follows the following process:

- Creates a release commit containing the specified files
- Moves the release tag to the release commit
- Moves the major and minor version tags to the release commit (if not draft or pre-release)

## Usage

```yml
name: Publish

on:
  release:
    types: [published, edited]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      # Checkout your repository
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: ${{ github.event.release.tag_name }}

      # Build your release
      - run: npm ci
      - run: npm run build

      # Create your semantically version release
      - uses: teunmooij/github-versioned-release@v1
        with:
          template: 'javascript-action'
        env:
          GITHUB_TOKEN: ${{ secrets.PAT }}
```

## Input

| Argument | Description                           | Default            |
| -------- | ------------------------------------- | ------------------ |
| version  | The version of the release            | `release.tag_name` |
| template | The template to use for the release   |                    |
| include  | The files to include in the release   | `**/*`             |
| exclude  | The files to exclude from the release |                    |

## Output

| Argument | Description            |
| -------- | ---------------------- |
| sha      | The sha of the release |

## Token

This action requires a `GITHUB_TOKEN` environment variable with sufficient scopes to run. The token needs to be allowed to create a commit and to push tags.

## Content of the release

The files that are included in the release are determined by the `template`, `include` and `exclude` input arguments and the optional `.gvrignore` file. [glob](https://www.npmjs.com/package/glob) is used to match the files. Patterns must be separated by a newline (\n).

### Included files

This action includes the following templates:

- composite-action, which includes action.yml and LICENSE files
- javascript-action, which includes action.yml, LICENSE file and dist folder

If no template is provided, the files matching the `include` parameter are included. If no `include` parameter is provided, all the files are included.

### Excluded files

If an `exclude` parameter is provided, all files matching the `exclude` parameter are excluded.
If no `exclude` parameter is provided, the action will search for a `.gvrignore` file in the root of the repository. If such a file is found, all files matching a `.gvrignore` file are excluded.

## Motivation

I wanted to be able to create clean, semantically versioned, releases of my github actions. When searching for an action I could use to accomplish this, I could not find any and decided to write one myself.

This action is inspired by [JasonEtco/build-and-tag-action](https://github.com/JasonEtco/build-and-tag-action).
