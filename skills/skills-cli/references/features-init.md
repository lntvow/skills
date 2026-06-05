---
name: features-init
description: Creating skills with npx skills init — SKILL.md template and required frontmatter fields.
---

# Creating Skills

`npx skills init` generates a new `SKILL.md` template.

```bash
# In current directory
npx skills init

# In a subdirectory
npx skills init my-skill
```

## SKILL.md Format

```markdown
---
name: my-skill
description: What this skill does and when to use it
---

# My Skill

Instructions for the agent to follow when this skill is activated.
```

### Required Fields

- `name`: Unique identifier (lowercase, hyphens allowed)
- `description`: Brief explanation of what the skill does and when to use it

### Optional: Internal Skills

```markdown
---
name: my-internal-skill
description: Hidden from normal discovery
metadata:
  internal: true
---
```

Set `INSTALL_INTERNAL_SKILLS=1` to reveal internal skills.

## Skill Directory Structure

```
my-skill/
└── SKILL.md
```

Additional reference files can be placed alongside `SKILL.md` for more detailed instructions.

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
-->
