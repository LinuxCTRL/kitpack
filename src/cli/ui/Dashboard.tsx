import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { SearchView } from './SearchView';
import { InstalledView } from './InstalledView';

type Tab = 'search' | 'installed';

const TAB_LABELS: Record<Tab, string> = {
  search: 'Search',
  installed: 'Installed',
};

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (key.leftArrow) {
      setActiveTab((prev) => {
        const tabs: Tab[] = ['search', 'installed'];
        const idx = tabs.indexOf(prev);
        return tabs[Math.max(0, idx - 1)] ?? prev;
      });
      return;
    }

    if (key.rightArrow) {
      setActiveTab((prev) => {
        const tabs: Tab[] = ['search', 'installed'];
        const idx = tabs.indexOf(prev);
        return tabs[Math.min(tabs.length - 1, idx + 1)] ?? prev;
      });
      return;
    }
  });

  return (
    <Box flexDirection="column" padding={1} minHeight={10}>
      {/* Header */}
      <Box borderStyle="single" borderColor="cyan" paddingX={2} marginBottom={1}>
        <Text color="cyan" bold>
          kitpack — AI Agent Skill Packager
        </Text>
      </Box>

      {/* Tab bar */}
      <Box marginBottom={1} flexDirection="row" gap={1}>
        {(['search', 'installed'] as Tab[]).map((tab) => (
          <Box
            key={tab}
            paddingX={1}
            borderStyle={activeTab === tab ? 'bold' : 'round'}
            borderColor={activeTab === tab ? 'cyan' : 'gray'}
          >
            <Text color={activeTab === tab ? 'cyan' : 'gray'} bold={activeTab === tab}>
              {' '}{TAB_LABELS[tab]}{' '}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Content */}
      <Box flexGrow={1} marginBottom={1}>
        {activeTab === 'search' && <SearchView onExit={exit} />}
        {activeTab === 'installed' && <InstalledView />}
      </Box>

      {/* Footer */}
      <Box borderStyle="single" borderColor="gray" paddingX={1} flexDirection="row" justifyContent="space-between">
        <Text color="gray">
          <Text color="cyan" bold>q</Text> quit  |
          <Text color="cyan" bold> ←→</Text> tabs
        </Text>
        <Text color="gray">
          kitpack v0.1.0
        </Text>
      </Box>
    </Box>
  );
}
