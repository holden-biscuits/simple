# Security policy

## Reporting a vulnerability or data exposure

Do not open a public issue containing a suspected vulnerability, private URL, credential, personal record, or real customer data. Use GitHub's private vulnerability reporting when it is available. Otherwise, open a detail-free issue asking the maintainer for a private reporting channel.

Include the affected path, a concise reproduction, and the type of data or access at risk. Do not copy sensitive values into the report when a redacted example is enough.

## Public-demo boundary

This repository is designed to contain synthetic demonstration data only. Before opening a pull request, run:

```bash
npm run check:public-demo
npm test
```

The automated scanner is a backstop, not permission to add production exports. Real operational data, private source links, credentials, and customer or prospect records must remain in access-controlled systems.
