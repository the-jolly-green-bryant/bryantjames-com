# Bryant James — Portfolio

<p align="center">
  One dependency-free build system. Two distinct identities. Two production sites.
</p>

<p align="center">
  <a href="https://github.com/the-jolly-green-bryant/bryantjames-com/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/the-jolly-green-bryant/bryantjames-com/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=111">
  <img alt="Dependencies" src="https://img.shields.io/badge/runtime_dependencies-0-success">
</p>

This repository powers two isolated static portfolios from one maintainable source:

| Build | Production site | Focus |
|---|---|---|
| `dist/bryant/` | [bryantjames.com](https://bryantjames.com) | Professional portfolio |
| `dist/bri/` | [bri.bryantjames.com](https://bri.bryantjames.com) | Creative portfolio |

The output is plain HTML, CSS, and a small accessible interaction script. There is
no client framework, runtime package dependency, or server process to operate.

## Engineering goals

- Keep each identity visually and semantically independent.
- Deliver fast, cache-friendly static output.
- Preserve keyboard and assistive-technology support for interactive controls.
- Generate metadata and JSON-LD alongside the page content.
- Deploy to AWS without long-lived cloud credentials.

## Local development

Requires a current Node.js release.

```bash
git clone https://github.com/the-jolly-green-bryant/bryantjames-com.git
cd bryantjames-com
npm run check
npm run build
```

Preview either generated site:

```bash
npm run preview -- bryant
npm run preview -- bri
```

## How the build works

```text
site data + shared assets
          │
          ▼
  scripts/build.mjs
     ┌────┴────┐
     ▼         ▼
dist/bryant  dist/bri
```

`scripts/build.mjs` produces both sites deterministically. `scripts/check.mjs`
validates the source and output assumptions, while `scripts/serve.mjs` provides a
small local static server for review.

## Deployment

Every push to `main` validates both builds and deploys each output directory to its
own S3 website. The production workflow uses GitHub's OpenID Connect integration to
assume a narrowly scoped AWS role—no persistent AWS access keys are stored in GitHub.

Repository configuration:

| Type | Name | Purpose |
|---|---|---|
| Secret | `AWS_DEPLOY_ROLE_ARN` | OIDC-trusted IAM role |
| Variable | `AWS_REGION` | S3 bucket region |
| Variable | `BRYANT_S3_BUCKET` | Professional-site bucket |
| Variable | `BRI_S3_BUCKET` | Creative-site bucket |

The role needs bucket listing/location access and object write/delete access only
for the two deployment buckets. Its trust policy should be restricted to this
repository's protected production environment.

## Security

Only public portfolio content belongs in this repository. Deployment backups,
environment files, private keys, and local AWS configuration are ignored. See
[SECURITY.md](SECURITY.md) for vulnerability reporting.
