import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { existsSync } from 'node:fs';
import { readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

interface LocalSkill {
  name: string;
  version: string;
  description: string;
  path: string;
}

export function InstalledView() {
  const [skills, setSkills] = useState<LocalSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const found: LocalSkill[] = [];

      const cwd = process.cwd();
      const skillsDir = join(cwd, '.kitpack', 'skills');
      if (existsSync(skillsDir)) {
        try {
          const entries = await readdir(skillsDir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const metaPath = join(skillsDir, entry.name, 'packs.json');
              const name = entry.name;
              if (existsSync(metaPath)) {
                try {
                  const meta = JSON.parse(await readFile(metaPath, 'utf-8'));
                  found.push({
                    name: meta.name ?? name,
                    version: meta.source ?? '',
                    description: `${meta.installs ?? 0} installs`,
                    path: join(skillsDir, entry.name),
                  });
                } catch {}
              } else {
                found.push({
                  name,
                  version: '',
                  description: '',
                  path: join(skillsDir, entry.name),
                });
              }
            }
          }
        } catch {}
      }

      const cwdPackDir = join(cwd, '.kitpack', 'packs.json');
      if (existsSync(cwdPackDir)) {
        try {
          const meta = JSON.parse(await readFile(cwdPackDir, 'utf-8'));
          found.push({
            name: meta.name ?? 'unknown',
            version: meta.version ?? '0.0.0',
            description: meta.description ?? '',
            path: join(cwd, '.kitpack'),
          });
        } catch {}
      }

      const globalDir = join(homedir(), '.kitpack', 'index');
      if (existsSync(globalDir)) {
        try {
          const entries = await readdir(globalDir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const metaPath = join(globalDir, entry.name, 'packs.json');
              if (existsSync(metaPath)) {
                try {
                  const meta = JSON.parse(await readFile(metaPath, 'utf-8'));
                  found.push({
                    name: meta.name ?? entry.name,
                    version: meta.version ?? '0.0.0',
                    description: meta.description ?? '',
                    path: join(globalDir, entry.name),
                  });
                } catch {}
              }
            }
          }
        } catch {}
      }

      setSkills(found);
      setLoading(false);
    }

    load();
  }, []);

  useInput(async (input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(skills.length - 1, prev + 1));
      return;
    }

    if ((input === 'x' || input === 'd') && skills.length > 0) {
      const skill = skills[selectedIndex];
      if (!skill) return;

      try {
        await rm(skill.path, { recursive: true, force: true });
        setSkills((prev) => prev.filter((s) => s.path !== skill.path));
        setSelectedIndex((prev) => Math.min(prev, skills.length - 2));
        setMessage(`Deleted ${skill.name}`);
      } catch (err: any) {
        setMessage(`Failed to delete: ${err.message}`);
      }
      return;
    }
  });

  if (loading) {
    return <Text dimColor>Scanning for installed skills...</Text>;
  }

  if (skills.length === 0) {
    return (
      <Box flexDirection="column">
        <Text dimColor>No skills installed.</Text>
        <Text dimColor>Run <Text bold>kitpack search</Text> to discover skills.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text bold>Installed Skills ({skills.length})</Text>
      </Box>

      {skills.map((skill, idx) => {
        const isSelected = idx === selectedIndex;
        const cursor = isSelected ? '▸ ' : '  ';
        return (
          <Box key={skill.path} flexDirection="column" marginBottom={1}>
            <Box>
              <Text color="cyan" bold={isSelected}>{cursor}</Text>
              <Text bold color={isSelected ? 'cyan' : 'white'}>{skill.name}</Text>
              {skill.version && (
                <Text color="gray">  ({skill.version})</Text>
              )}
            </Box>
            {skill.description && (
              <Box marginLeft={2}>
                <Text dimColor>{skill.description}</Text>
              </Box>
            )}
            <Box marginLeft={2}>
              <Text dimColor>{skill.path}</Text>
            </Box>
          </Box>
        );
      })}

      {message && (
        <Box marginTop={1}>
          <Text color="yellow">{message}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray">
          <Text color="cyan" bold>↑↓</Text> navigate  |
          <Text color="cyan" bold> x</Text> delete selected
        </Text>
      </Box>
    </Box>
  );
}
