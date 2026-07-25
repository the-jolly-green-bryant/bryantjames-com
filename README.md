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

Production deployment is manual through the `Build and deploy portfolios` GitHub Actions workflow. It uses GitHub OIDC and does not store AWS access keys in the repository.

Configure the GitHub repository with:

- Secret `AWS_DEPLOY_ROLE_ARN`: IAM role trusted by this repository’s GitHub OIDC subject.
- Variable `AWS_REGION`: bucket region.
- Variables `BRI_S3_BUCKET` and `BRYANT_S3_BUCKET`: distinct bucket names.
- Optional variables `BRI_CLOUDFRONT_DISTRIBUTION_ID` and `BRYANT_CLOUDFRONT_DISTRIBUTION_ID`.

Grant the role `s3:ListBucket`, `s3:GetBucketLocation`, `s3:PutObject`, and `s3:DeleteObject` only on the two deployment buckets. If invalidation is enabled, also grant `cloudfront:CreateInvalidation` for the two distributions.

Only public portfolio content belongs in this repository. Local deployment backups, environment files, private keys, and AWS configuration are ignored.
