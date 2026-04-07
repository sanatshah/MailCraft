# Skill audit reference

## Subagent defaults

Use these defaults unless the user asks otherwise:

- Tool: `Subagent`
- `subagent_type`: `explore`
- `readonly`: `true`
- Scope: `.cursor/skills/`
- Read order: `SKILL.md` first, `reference.md` only when needed

## Audit types

### overlap

Purpose: find skills that do the same job, partially duplicate each other, or are broad enough to hide a more specific skill.

Focus on:

- names and descriptions that imply the same user request
- repeated trigger terms
- overlapping workflows and outputs
- broad skills that shadow narrower ones

Return findings as:

```markdown
### Overlap
- Severity: high | medium | low
  Skills: `skill-a`, `skill-b`
  Why they overlap: ...
  Evidence: ...
  Recommendation: merge | narrow | rename | keep separate
```

Prompt template:

```text
Audit `.cursor/skills/` for overlap issues. Read every `SKILL.md` first and only inspect supporting `reference.md` files if scope is unclear. Compare skills by job-to-be-done, trigger phrases, workflow, and output. Report exact duplicates, partial overlap, shadowing, and clearly-adjacent skills. Use repo-specific evidence and return results in the required Overlap format. If there are no issues, say so explicitly.
```

### efficiency

Purpose: find skill content that costs too many tokens, slows routing, or adds workflow complexity without improving reliability.

Focus on:

- verbose or obvious explanation
- repeated guidance
- too many options without a default
- examples that add little signal
- detail that should move into `reference.md`
- workflows longer than the common case needs

Return findings as:

```markdown
### Efficiency
- Severity: high | medium | low
  Skill: `skill-name`
  Problem: ...
  Why it is costly: tokens | routing ambiguity | workflow drag
  Suggested change: cut | move to reference | collapse steps | choose default
```

Prompt template:

```text
Audit `.cursor/skills/` for efficiency issues. Read every `SKILL.md` first and only inspect supporting `reference.md` files when needed to confirm whether detail is misplaced. Look for verbosity, repetition, weak progressive disclosure, too many options, and unnecessary workflow steps. Recommend the smallest change that improves routing clarity or token efficiency without removing essential safety. Return results in the required Efficiency format, or say there are no issues.
```

### best-practices

Purpose: find red flags that make skills hard to discover, risky to use, stale, or inconsistent.

Focus on:

- vague names or descriptions
- missing trigger terms
- unsafe instructions without validation
- stale paths or time-sensitive guidance
- inconsistent terminology
- conflicting defaults or structure problems

Return findings as:

```markdown
### Best practices
- Severity: blocking | major | minor
  Skill: `skill-name`
  Area: discovery | structure | safety | freshness | consistency
  Issue: ...
  Recommendation: ...
```

Prompt template:

```text
Audit `.cursor/skills/` for best-practice red flags. Read every `SKILL.md` first and inspect supporting `reference.md` files only when structure or drift is unclear. Prioritize routing, safety, freshness, and consistency issues over stylistic nits. Use repo-specific evidence. Return findings in the required Best practices format, or explicitly state that no issues were found.
```

## Merge guidance

When combining subagent outputs:

- group findings under the three audit headings
- sort each section by severity
- remove duplicates where two audit types report the same underlying issue
- keep the sharper recommendation if findings overlap
