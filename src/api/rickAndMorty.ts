import type { Character } from '../types';

const API_URL = 'https://rickandmortyapi.com/graphql';

interface CharactersQueryResult {
  characters: {
    results: Character[];
  } | null;
}

export async function searchCharacters(name: string, signal?: AbortSignal): Promise<Character[]> {
  const query = `
    query SearchCharacters($name: String) {
      characters(page: 1, filter: { name: $name }) {
        results {
          id
          name
          image
        }
      }
    }
  `;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { name } }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Rick and Morty API request failed: ${response.status}`);
  }

  const { data, errors } = await response.json();

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return (data as CharactersQueryResult).characters?.results ?? [];
}
