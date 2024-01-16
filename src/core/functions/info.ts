import { format } from 'node:util';

export const infoFunctions = {
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
        const { info } = game.config;

        switch (detail) {
            case 1: {
                return format('%s', info.version);
            }

            case 2: {
                return format('%s-%s', info.version, info.branch);
            }

            case 3: {
                if (info.build === 0) {
                    return format('%s-%s', info.version, info.branch);
                }

                return format('%s-%s.%s', info.version, info.branch, info.build);
            }

            case 4: {
                if (info.build === 0) {
                    return format('%s-%s (%s)', info.version, info.branch, this.latestCommit());
                }

                return format('%s-%s.%s (%s)', info.version, info.branch, info.build, this.latestCommit());
            }

            default: {
                throw new Error('Invalid detail amount');
            }
        }
    },

    /**
     * Returns the latest commit hash
     */
    latestCommit(): string {
        if (game.cache.latestCommitHash === undefined) {
            // Save to a cache since `runCommand` is slow.
            try {
                game.cache.latestCommitHash = game.functions.util.runCommand('git rev-parse --short=7 HEAD').trim();
            } catch (error) {
                if (!(error instanceof Error)) {
                    throw new TypeError('`err` is not an error in latestCommit');
                }

                /*
                 * Sets the cache to the error in order to prevent
                 * repeatedly trying to get the latest commit hash
                 * even though it will always fail.
                 */
                game.cache.latestCommitHash = error;
                game.logDebug('Failed to get latest commit hash:', error.stack);
                console.log('<red>ERROR: Git is not installed.</red>');
                return 'no git found';
            }
        }

        return game.cache.latestCommitHash as string;
    },
};
