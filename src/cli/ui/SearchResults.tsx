import React from 'react';
import { Box, Text } from 'ink';
import type { SkillSearchResult } from '../../core/types';

interface Props {
  results: SkillSearchResult[];
  query: string;
}

function formatInstalls(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function SearchResults({ results, query }: Props) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </Text>
      </Box>
      {results.map((skill) => (
        <Box key={skill.id} flexDirection="column" marginBottom={1}>
          <Box>
            <Text bold color="cyan">{skill.name}</Text>
            <Text> </Text>
            <Text color="green">{formatInstalls(skill.installs)} installs</Text>
          </Box>
          <Box>
            <Text dimColor>{skill.source}</Text>
          </Box>
          <Box>
            <Text dimColor>{skill.url}</Text>
          </Box>
        </Box>
      ))}
      <Box marginTop={1}>
        <Text dimColor>Run: kitpack install {'<owner/repo/skill>'}</Text>
      </Box>
    </Box>
  );
}
