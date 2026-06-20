export function formatInstalls(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function trustColor(label: string): string {
  switch (label) {
    case 'excellent': return 'green';
    case 'good': return 'green';
    case 'moderate': return 'yellow';
    case 'low': return 'red';
    case 'poor': return 'red';
    default: return 'white';
  }
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'red';
    case 'high': return 'red';
    case 'medium': return 'yellow';
    case 'low': return 'yellow';
    default: return 'white';
  }
}

export function auditStatusColor(status: string): string {
  switch (status) {
    case 'pass': return 'green';
    case 'warn': return 'yellow';
    case 'fail': return 'red';
    default: return 'white';
  }
}
