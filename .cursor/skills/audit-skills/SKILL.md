---
name: audit-skills
description: Audits repository skills for duplicates, inefficiencies, and best-practice red flags by launching one readonly subagent per audit type and synthesizing the results. Use when reviewing `.cursor/skills/`, checking skill quality, finding duplicate skills, or looking for maintainability issues.
---

# Audit skills

## Goal

Audit skills in a repository by delegating each audit type to its own readonly subagent, then combine the findings into one report.

## Default target

Audit project skills in `.cursor/skills/` unless the user explicitly asks to include personal skills.

## Workflow

1. Read [reference.md](reference.md) to determine which audit types to run and which prompt template matches each one.
2. If the user does not narrow the scope, run all audit types:
   - overlap
   - efficiency
   - best-practices
3. Launch one readonly `Subagent` per audit type in parallel.
4. Use `subagent_type: "explore"` for repository scanning and synthesis.
5. In each subagent prompt:
   - target `.cursor/skills/`
   - read each `SKILL.md` first
   - only read `reference.md` when needed for clarification
   - return findings using the format defined in `reference.md`
6. Merge the subagent results into one audit report:
   - group by audit type
   - order findings by severity
   - deduplicate repeated issues across audit types
7. End with a short remediation summary listing the highest-value fixes first.

## Subagent rules

- Run the audit subagents in parallel when more than one audit type is requested.
- Keep subagents readonly.
- Prefer repo-specific evidence over generic skill advice.
- If an audit type returns no issues, explicitly say so in the combined report.

## Output format

Use this structure:

```markdown
## Skill audit

### Overlap
- ...

### Efficiency
- ...

### Best practices
- ...

## Recommended fixes
- ...
```

## Deep reference

For audit type definitions, heuristics, and subagent prompt templates, read [reference.md](reference.md).
