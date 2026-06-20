import React from 'react';
import { Box, Text } from 'ink';
import type { InstallPreview } from '../../core/types';
import { formatInstalls, trustColor, severityColor, auditStatusColor } from './utils';

interface Props {
  preview: InstallPreview;
}

export function SkillDetail({ preview }: Props) {
  const { skill, trust, findings, audit } = preview;
  const critical = findings.filter((f) => f.severity === 'critical').length;
  const high = findings.filter((f) => f.severity === 'high').length;
  const medium = findings.filter((f) => f.severity === 'medium').length;
  const low = findings.filter((f) => f.severity === 'low').length;

  return (
    <Box flexDirection="column" padding={0}>
      <Box marginBottom={1}>
        <Text bold color="cyan">{skill.slug}</Text>
        <Text> from </Text>
        <Text bold>{skill.source}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Installs: </Text>
        <Text bold>{formatInstalls(skill.installs)}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Trust Score: </Text>
        <Text bold color={trustColor(trust.label)}>{trust.score}/100 ({trust.label})</Text>
      </Box>

      <Box marginBottom={1} flexDirection="column">
        <Text bold>Security Findings:</Text>
        {findings.length === 0 ? (
          <Text color="green">  No issues detected</Text>
        ) : (
          <>
            {critical > 0 && <Text color="red">  {critical} critical</Text>}
            {high > 0 && <Text color="red">  {high} high</Text>}
            {medium > 0 && <Text color="yellow">  {medium} medium</Text>}
            {low > 0 && <Text color="yellow">  {low} low</Text>}
          </>
        )}
      </Box>

      {findings.length > 0 && (
        <Box marginBottom={1} flexDirection="column">
          <Text bold>Findings:</Text>
          {findings.slice(0, 8).map((f, i) => (
            <Box key={i}>
              <Text color={severityColor(f.severity)}>[{f.severity.toUpperCase()}]</Text>
              <Text> {f.description}</Text>
              <Text dimColor> ({f.file}:{f.line})</Text>
            </Box>
          ))}
          {findings.length > 8 && (
            <Text dimColor>  ... and {findings.length - 8} more</Text>
          )}
        </Box>
      )}

      {audit && (
        <Box marginBottom={1} flexDirection="column">
          <Text bold>Audits:</Text>
          {audit.audits.map((a, i) => (
            <Box key={i}>
              <Text color={auditStatusColor(a.status)}>[{a.status.toUpperCase()}]</Text>
              <Text> {a.provider}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Files: {skill.files?.length ?? 0} | Hash: {skill.hash?.slice(0, 12) ?? 'N/A'}</Text>
      </Box>
    </Box>
  );
}
