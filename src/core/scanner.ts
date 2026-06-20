import type { SecurityFinding } from './types';

interface ScanRule {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  pattern: RegExp;
  filePattern?: RegExp;
}

const RULES: ScanRule[] = [
  {
    id: 'eval-usage',
    severity: 'high',
    description: 'Uses eval() which can execute arbitrary code',
    pattern: /\beval\s*\(/i,
  },
  {
    id: 'exec-commands',
    severity: 'high',
    description: 'Executes shell commands via exec or spawn',
    pattern: /\b(exec|spawn|execSync|execFile)\s*\(/i,
  },
  {
    id: 'curl-bash-pipe',
    severity: 'critical',
    description: 'Downloads and pipes to shell (curl | sh pattern)',
    pattern: /curl\s+.*\|\s*(bash|sh)\b/i,
  },
  {
    id: 'wget-bash-pipe',
    severity: 'critical',
    description: 'Downloads and pipes to shell (wget | sh pattern)',
    pattern: /wget\s+.*\|\s*(bash|sh)\b/i,
  },
  {
    id: 'base64-decode-exec',
    severity: 'critical',
    description: 'Base64 decoded content passed to shell',
    pattern: /(base64\s*-d|echo\s+.*\|.*base64\s*-d).*(bash|sh)/i,
  },
  {
    id: 'npm-run-build',
    severity: 'medium',
    description: 'Runs build scripts during install (postinstall)',
    pattern: /postinstall|prepare|prepublish/i,
  },
  {
    id: 'env-access',
    severity: 'low',
    description: 'Reads environment variables (potential credential access)',
    pattern: /\bprocess\.env\b|\$ENV\b|\$\{.*ENV.*\}/i,
  },
  {
    id: 'file-write',
    severity: 'medium',
    description: 'Writes files to the filesystem',
    pattern: /\b(writeFile|appendFile|writeFileSync)\s*\(/i,
  },
  {
    id: 'require-dynamic',
    severity: 'medium',
    description: 'Dynamic require() which can load arbitrary modules',
    pattern: /\brequire\s*\(\s*[^"']/i,
  },
  {
    id: 'import-dynamic',
    severity: 'medium',
    description: 'Dynamic import() which can load arbitrary modules',
    pattern: /\bimport\s*\(\s*[^"']/i,
  },
  {
    id: 'network-request',
    severity: 'low',
    description: 'Makes network requests (potential data exfiltration)',
    pattern: /\b(fetch|axios|got|request|https\.get)\s*\(/i,
  },
  {
    id: 'hidden-file-access',
    severity: 'medium',
    description: 'Accesses hidden files or directories',
    pattern: /(~\/\.|\/\.\w+|home\/[\w-]+\/\.)/i,
  },
  {
    id: 'rm-rf',
    severity: 'high',
    description: 'Recursive force delete (rm -rf)',
    pattern: /\brm\s+[-]rf\b/i,
  },
  {
    id: 'chmod-777',
    severity: 'high',
    description: 'Sets world-writable permissions',
    pattern: /chmod\s+[-]*777/i,
  },
  {
    id: 'sudo-command',
    severity: 'high',
    description: 'Runs commands with sudo (privilege escalation)',
    pattern: /\bsudo\s+/i,
  },
  {
    id: 'obfuscated-js',
    severity: 'high',
    description: 'Contains obfuscated JavaScript (potential malware)',
    pattern: /(?:\\x[0-9a-f]{2}){10,}|String\.fromCharCode|unescape\s*\(/i,
  },
];

export function scanContent(content: string, fileName: string, rules: ScanRule[] = RULES): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  for (const rule of rules) {
    if (rule.filePattern && !rule.filePattern.test(fileName)) continue;
    const match = content.match(rule.pattern);
    if (match) {
      const lineNumber = getLineNumber(content, match.index ?? 0);
      findings.push({
        severity: rule.severity,
        rule: rule.id,
        description: rule.description,
        file: fileName,
        line: lineNumber,
      });
    }
  }
  return findings;
}

function getLineNumber(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function scanSkill(files: { path: string; contents: string }[]): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  for (const file of files) {
    const fileFindings = scanContent(file.contents, file.path);
    findings.push(...fileFindings);
  }
  return findings;
}

export function summarizeFindings(findings: SecurityFinding[]): {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
} {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, total: findings.length };
  for (const f of findings) {
    counts[f.severity]++;
  }
  return counts;
}
