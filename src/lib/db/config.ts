/**
 * Local PGlite data directory (git-ignored). E2E runs use their own
 * directory (PGLITE_DATA_DIR=.pglite-e2e) so tests never touch the dev database.
 */
export const PGLITE_DATA_DIR = process.env.PGLITE_DATA_DIR || ".pglite";
