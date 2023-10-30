import { format } from 'node:util';

export const INFO_FUNCTIONS = {
    /**
     * Returns the version of the game.
     *
     * If detail is 1:
     * version
     *
     * If detail is 2:
     * version-branch
     *
     * If detail is 3:
     * version-branch.build
     *
     * If detail is 4:
     * version-branch.build (commit hash)
     */
    version(detail = 1): string {
        const { info: INFO } = game.config;

        switch (detail) {
            case 1: {
                return format('%s', INFO.version);
            }

            case 2: {
                return format('%s-%s', INFO.version, INFO.branch);
            }

            case 3: {
                return format('%s-%s.%s', INFO.version, INFO.branch, INFO.build);
            }

            case 4: {
                return format('%s-%s.%s (%s)', INFO.version, INFO.branch, INFO.build, this.latestCommit());
            }

            default: {
                throw new Error('Invalid detail amount');
            }
        }
    },

    /**
     * Returns the latest commit hash
     */
    latestCommit() {
        if (!game.cache.latestCommitHash) {
            // Save to a cache since `runCommand` is slow.
            game.cache.latestCommitHash = game.functions.util.runCommand('git rev-parse --short=7 HEAD');
        }

        const HASH = game.cache.latestCommitHash as string | Error;

        if (HASH instanceof Error) {
            // TODO: Save as a thing of interest. #259
            game.log('<red>ERROR: Git is not installed.</red>');
            return 'no git found';
        }

        return HASH.trim();
    },
};
