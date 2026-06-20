# kitpack

> AI agent skill packager — bundle, version, publish, and discover reusable agent instructions.

**Stack:** TypeScript, Ink (React for CLIs), skills.sh API, npm-published CLI + library

📖 **Documentation:** [linuxctrl-docs.vercel.app/docs/kitpack](https://linuxctrl-docs.vercel.app/docs/kitpack)

---

## Quick start

```sh
npm install -g @linuxctrl/kitpack
kitpack                          # Open interactive TUI dashboard
kitpack search "react testing"   # Discover skills
kitpack install owner/repo/skill # Inspect and install
kitpack init                     # Scaffold a new skill
kitpack add cursor/rules.md      # Add a file to the bundle
kitpack publish                  # Publish to a registry
```

---

## Features

### Interactive TUI Dashboard

Run `kitpack` without arguments to open a full keyboard-navigable terminal UI:
- **Search tab** — type to search 600K+ skills from skills.sh (debounced 300ms), navigate with ↑↓, press Enter to inspect, `i` to install
- **Installed tab** — list all installed skills, `x` to delete
- **Skill detail view** — security scan findings, partner audit results, trust score, file tree preview

### Security Scanner

Every skill is scanned for **16 malicious patterns** before install:

| Severity | Patterns |
|----------|----------|
| Critical | curl \| sh, wget \| sh, base64 decode → exec |
| High | eval(), exec/spawn, rm -rf, chmod 777, sudo, obfuscated JS |
| Medium | postinstall scripts, dynamic require/import, file writes, hidden file access |
| Low | ENV access, network requests |

### Trust Scoring

Weighted **0–100 score** combining four factors:

| Factor | Weight | Source |
|--------|--------|--------|
| Security scan | 30% | Local 16-rule analysis with severity-weighted penalty |
| GitHub stars | 25% | Fetched via GitHub API from the source repo |
| Partner audits | 25% | skills.sh partner providers (Socket, Snyk, Runlayer, ZeroLeaks, Gen Agent Trust Hub) |
| Install count | 20% | skills.sh install statistics |

### skills.sh Ecosystem Integration

- **Search** 600K+ skills from the [Vercel-powered registry](https://skills.sh)
- **Download** skill files and metadata
- **Partner audits** via Vercel OIDC-authenticated API (`VERCEL_OIDC_TOKEN`)

### CLI Commands

| Command | Description |
|---------|-------------|
| `kitpack` | Open the interactive TUI dashboard |
| `kitpack search <query>` | Search skills.sh for skills |
| `kitpack install <owner/repo/skill>` | Inspect, scan, and install a skill |
| `kitpack init` | Scaffold a new skill project |
| `kitpack add <file...>` | Add files to the skill bundle |
| `kitpack publish` | Publish the skill to a registry |

### Programmatic API

```ts
import {
  searchSkills,         // Search skills.sh registry
  getSkillDetail,       // Download skill files + metadata
  getSkillAudit,        // Fetch partner security audits
  fetchSkillReadme,     // Get SKILL.md content
  scanContent,          // Scan a file for malicious patterns
  scanSkill,            // Scan all files in a skill
  summarizeFindings,    // Aggregate findings by severity
  computeTrustScore,    // Compute 0–100 trust score
  fetchGitHubStars,     // Get star count from GitHub API
  installSkill,         // Install skill to .kitpack/skills/
  loadConfig,           // Load configuration
} from '@linuxctrl/kitpack';
```

### Data Directory

Installed skills are stored in `.kitpack/skills/<name>/`:

```
.kitpack/
  packs.json            # Project skill metadata
  skills/
    <skill-name>/       # Each installed skill
      packs.json        # Install metadata
      files/
        SKILL.md        # Skill instructions
        ...
  files/                # Files added via kitpack add
```

### Configuration

Reads from `.kitpack/config.json` or `~/.kitpack/config.json`:

```json
{
  "registry": "local",
  "localIndexDir": "~/.kitpack/index"
}
```

**Environment variables:**

| Variable | Purpose |
|----------|---------|
| `VERCEL_OIDC_TOKEN` | Authenticated access to skills.sh V1 API (audits) |

---

## License

MIT
