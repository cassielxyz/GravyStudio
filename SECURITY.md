# Security

GraviStudio is intentionally local-first. It binds the dashboard server to `127.0.0.1`, never enables Antigravity's unrestricted permission bypass, and does not store Antigravity credentials.

## Trust model

- Antigravity CLI uses its own cached sign-in and permission engine.
- Uploaded assets stay under the local GraviStudio data directory unless a selected upstream engine is explicitly configured otherwise.
- Third-party video engines are cloned into `~/.gravistudio/tools/` and retain their own licenses and security assumptions.
- Free Mode blocks the GraviStudio agent instructions from intentionally selecting paid media APIs. It is a workflow policy, not a billing firewall for tools the user independently configures.

## Reporting

Do not include secrets, private media, API keys or access tokens in public issue reports. Include only sanitized logs and the failing module/version.
