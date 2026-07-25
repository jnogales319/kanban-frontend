import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCharacters } from './rickAndMorty';

function mockFetch(response: Partial<Response> & { json: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCharacters', () => {
  it('posts a GraphQL query with the search term as a variable', async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ data: { characters: { results: [] } } }),
    });

    await searchCharacters('rick');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://rickandmortyapi.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.variables).toEqual({ name: 'rick' });
    expect(body.query).toContain('characters');
  });

  it('forwards an AbortSignal when provided', async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ data: { characters: { results: [] } } }),
    });
    const controller = new AbortController();

    await searchCharacters('rick', controller.signal);

    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('returns the character results on success', async () => {
    const characters = [{ id: '1', name: 'Rick Sanchez', image: 'rick.png' }];
    mockFetch({
      ok: true,
      json: async () => ({ data: { characters: { results: characters } } }),
    });

    await expect(searchCharacters('rick')).resolves.toEqual(characters);
  });

  it('returns an empty array when the API has no matches (null characters)', async () => {
    mockFetch({
      ok: true,
      json: async () => ({ data: { characters: null } }),
    });

    await expect(searchCharacters('zzznomatch')).resolves.toEqual([]);
  });

  it('throws when the HTTP response is not ok', async () => {
    mockFetch({ ok: false, status: 429, json: async () => ({}) });

    await expect(searchCharacters('rick')).rejects.toThrow(
      'Rick and Morty API request failed: 429',
    );
  });

  it('throws with the GraphQL error message when errors are returned', async () => {
    mockFetch({
      ok: true,
      json: async () => ({ errors: [{ message: 'Something went wrong' }] }),
    });

    await expect(searchCharacters('rick')).rejects.toThrow('Something went wrong');
  });
});
