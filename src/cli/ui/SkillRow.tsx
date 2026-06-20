import React from 'react';
import { Box, Text } from 'ink';
import type { SkillSearchResult } from '../../core/types';
import { formatInstalls } from './utils';

interface Props {
  skill: SkillSearchResult;
  isSelected: boolean;
}

export function SkillRow({ skill, isSelected }: Props) {
  const cursor = isSelected ? '▸ ' : '  ';
  const nameColor = isSelected ? 'cyan' : 'white';

  return (
    <Box flexDirection="row" justifyContent="space-between">
      <Box flexDirection="row" flexGrow={1}>
        <Text color="cyan" bold={isSelected}>{cursor}</Text>
        <Text color={nameColor} bold={isSelected} wrap="truncate-end">
          {skill.name}
        </Text>
      </Box>
      <Box flexDirection="row">
        <Text color="green">{formatInstalls(skill.installs)}</Text>
        <Text color="gray"> </Text>
        <Text dimColor>{skill.source}</Text>
      </Box>
    </Box>
  );
}
