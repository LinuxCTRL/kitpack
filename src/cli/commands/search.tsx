import { searchSkills } from '../../core/api';
import { render } from 'ink';
import React from 'react';
import { SearchResults } from '../ui/SearchResults';

export async function searchCommand(query: string) {
  if (!query) {
    console.error('Usage: kitpack search <query>');
    process.exit(1);
  }

  console.error(`Searching for "${query}"...`);
  const results = await searchSkills({ query });

  if (results.length === 0) {
    console.log('No skills found.');
    return;
  }

  const { waitUntilExit } = render(<SearchResults results={results} query={query} />);
  await waitUntilExit();
}
