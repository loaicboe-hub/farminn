---
name: smart-development
description: >-
  Enforces token-efficient, focused development and manual-only audit/testing
  boundaries. Use whenever planning edits, inspecting files, verifying changes,
  or responding to requests that might otherwise trigger full-repo scans or
  automatic end-to-end test runs.
---

# Smart Development Skill

Follow these operational discipline rules on every task to avoid wasted tokens, credits, and unintended side effects.

## Focused Development Rules

- **Minimal Inspection**: Read only files directly tied to the current task; avoid repeated full-repository scans.
- **Minimal Changes**: Edit only required files; reuse existing components in `foundation/` and `config/`; never create duplicate utilities or rewrite unrelated working code.
- **Additive-Only**: Integrate new capabilities without removing working features, DB columns, or configurations.
- **Lightweight Verification Only**: After an edit, verify only the modified component, route, database query, or file syntax.

## Manual-Only Audits & Testing

Never automatically execute:
- Full project audits or full security audits
- Full regression test suites or full website crawls
- Playwright / browser automation / User Journey Testing
- Database-wide audits or heavy performance load testing

Only run an audit (`Full Security Audit`, `Full Website Audit`, `Database Audit`, `UI/UX Audit`, `Responsive Audit`, `User Journey Test`, `Deployment Audit`, `Performance Audit`) when explicitly requested by the user, and keep strictly within the requested scope.

## Exception

If a critical security risk is observed during normal work, immediately stop and report it clearly to the user.

