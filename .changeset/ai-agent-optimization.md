---
"@lucid-agents/create-agent-kit": patch
"@lucid-agents/agent-kit": patch
"@lucid-agents/agent-kit-identity": patch
---

AI agent optimization and documentation enhancement

### Non-Interactive CLI Arguments

Added support for passing template arguments via CLI flags in non-interactive mode. AI coding agents can now fully automate project scaffolding:

```bash
bunx @lucid-agents/create-agent-kit my-agent \
  --template=identity \
  --non-interactive \
  --AGENT_DESCRIPTION="My agent" \
  --PAYMENTS_RECEIVABLE_ADDRESS="0x..."
```

### AGENTS.md Documentation

Added comprehensive AGENTS.md files following the agents.md industry standard (20,000+ projects):

- Template-specific guides for blank, axllm, axllm-flow, and identity templates
- Root-level monorepo guide with architecture overview and API reference
- Example-driven with copy-paste-ready code samples
- Covers entrypoint patterns, testing, troubleshooting, and common use cases

### Template Schema JSON

Added machine-readable JSON Schema files (`template.schema.json`) for each template documenting all configuration arguments, types, and defaults.

### Improvements

- Fixed boolean handling in environment setup (boolean false now correctly outputs "false" not empty string)
- Converted IDENTITY_AUTO_REGISTER to confirm-type prompt for better UX
- Added 11 new comprehensive test cases (21 total, all passing)
- Updated CLI help text and README with non-interactive examples

### Bug Fixes

- Fixed release bot workflow to use proper dependency sanitization script
- Ensures published npm packages have resolved workspace and catalog dependencies

