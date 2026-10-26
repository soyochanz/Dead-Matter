import discordCommits from '../data/discordCommits.json';

export { discordCommits };

// Prefer database IDs and build associations, retaining the verified source
// metadata when an imported hash is subsequently added to the database.
export function mergeCommits(remote = []) {
  const byHash = new Map();
  for (const commit of [...discordCommits, ...remote]) {
    const key = commit.commit_hash?.trim().toLowerCase().slice(0, 7) || commit.id;
    const existing = byHash.get(key);
    byHash.set(key, existing ? { ...commit, ...existing, id: commit.id, update_micro_changes: commit.update_micro_changes } : commit);
  }
  return [...byHash.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || a.id.localeCompare(b.id));
}
