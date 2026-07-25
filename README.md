# Dual-identity static portfolio

One source builds two isolated, static sites:

- `dist/bri/` → `bri.bryantjames.com`
- `dist/bryant/` → `bryantjames.com`

## Commands

```sh
npm run build
npm run check
npm run preview -- bri
npm run preview -- bryant
```

The output is static HTML and CSS with a small, dependency-free script for accessible slider controls. JSON-LD structured data is included for search engines.

## AWS deployment

Every push to `main` validates both builds and deploys `dist/bryant/` and `dist/bri/` to their separate production S3 websites. The `Deploy production` workflow can also be run manually. It uses short-lived GitHub OIDC credentials and does not store AWS access keys in GitHub.

Configure the GitHub repository with:

- Secret `AWS_DEPLOY_ROLE_ARN`: IAM role trusted by this repository’s GitHub OIDC subject.
- Variable `AWS_REGION`: bucket region.
- Variables `BRYANT_S3_BUCKET` and `BRI_S3_BUCKET`: separate production bucket names.

Restrict the OIDC role trust to this repository’s protected production environment. Grant it `s3:ListBucket` and `s3:GetBucketLocation` on the production buckets, plus `s3:PutObject` and `s3:DeleteObject` on those buckets’ objects.

Only public portfolio content belongs in this repository. Local deployment backups, environment files, private keys, and AWS configuration are ignored.
