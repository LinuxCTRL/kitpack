# kitpack

> AI agent skill packager — bundle, version, and publish reusable agent instructions.

**Stack:** TypeScript, Ink (terminal UI), npm-published CLI + library

```
npm install -g kitpack
kitpack init                    # Scaffold a new skill
kitpack add cursor/rules.md     # Add a file to the skill bundle
kitpack publish                 # Publish to a registry (npm/local)
kitpack search "react testing"  # Discover skills
kitpack install cursor-rules    # Install a skill to your project
```

- Skills are directories with metadata (`packs.json`), prompts, rules, and configs.
- Versioned and published as npm packages or to a local index.
- CLI dashboard shows published skills, versions, install counts.
- Programmatic API: `import { installSkill, publishSkill } from 'kitpack'`.
