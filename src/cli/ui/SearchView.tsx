import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { searchSkills, getSkillDetail, getSkillAudit } from '../../core/api';
import { scanSkill } from '../../core/scanner';
import { computeTrustScore, getGitHubRepoFromSource, fetchGitHubStars } from '../../core/trust';
import { installSkill } from '../../core/packer';
import { SkillRow } from './SkillRow';
import { SkillDetail } from './SkillDetail';
import type { SkillSearchResult, InstallPreview } from '../../core/types';

interface Props {
  onExit: () => void;
}

type View = 'search' | 'detail';

export function SearchView({ onExit }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SkillSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [view, setView] = useState<View>('search');
  const [preview, setPreview] = useState<InstallPreview | null>(null);
  const [message, setMessage] = useState('');

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    const res = await searchSkills({ query: q });
    setResults(res);
    setSelectedIndex(0);
    setHasSearched(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  useInput(async (input, key) => {
    if (view === 'detail') {
      if (input === 'b' || key.escape) {
        setView('search');
        setPreview(null);
        setMessage('');
      }
      if (input === 'i' && preview) {
        setMessage('Installing...');
        try {
          const path = await installSkill(preview.skill);
          setMessage(`Installed at ${path}`);
        } catch (err: any) {
          setMessage(`Install failed: ${err.message}`);
        }
      }
      return;
    }

    if (input === 'q') {
      onExit();
      return;
    }

    if (key.return) {
      const selected = results[selectedIndex];
      if (!selected) return;

      setLoading(true);
      const [detail, audit] = await Promise.all([
        getSkillDetail(selected.source, selected.slug),
        getSkillAudit(selected.source, selected.slug),
      ]);

      if (!detail?.files) {
        setLoading(false);
        return;
      }

      const findings = scanSkill(detail.files);
      const repoInfo = getGitHubRepoFromSource(selected.source);
      const stars = repoInfo ? await fetchGitHubStars(repoInfo.owner, repoInfo.repo) : 0;
      const trust = computeTrustScore(selected.installs, stars, audit?.audits ?? [], findings);

      setPreview({
        skill: {
          id: selected.id,
          source: selected.source,
          slug: selected.slug,
          installs: selected.installs,
          hash: detail.hash ?? null,
          files: detail.files,
        },
        trust,
        findings,
        audit,
      });
      setView('detail');
      setLoading(false);
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(results.length - 1, prev + 1));
      return;
    }

    if (key.backspace || key.delete) {
      setQuery((prev) => prev.slice(0, -1));
      return;
    }

    if (input.length === 1 && !key.ctrl && !key.meta && !key.escape) {
      setQuery((prev) => prev + input);
    }
  });

  if (view === 'detail' && preview) {
    return (
      <Box flexDirection="column" flexGrow={1}>
        <SkillDetail preview={preview} />
        {message && (
          <Box marginTop={1}>
            <Text>{message}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text color="gray">
            <Text color="cyan" bold>b</Text> back  |
            <Text color="cyan" bold> i</Text> install  |
            <Text color="cyan" bold> esc</Text> back
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text bold>Search: </Text>
        <Text>{query || <Text dimColor>Type to search skills...</Text>}</Text>
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        {loading && results.length === 0 && (
          <Text dimColor>Searching...</Text>
        )}

        {hasSearched && !loading && results.length === 0 && (
          <Text dimColor>No skills found for "{query}"</Text>
        )}

        {results.map((skill, idx) => (
          <SkillRow key={skill.id} skill={skill} isSelected={idx === selectedIndex} />
        ))}
      </Box>
    </Box>
  );
}
