import { lazy } from 'react';

export const lazyImport = (factory) => {
    return lazy(async () => {
        try {
            return await factory();
        } catch (error) {
            const message = error.toString();
            // Check for specific error phrases related to missing chunks/modules
            if (
                message.includes('Failed to fetch dynamically imported module') ||
                message.includes('Importing a module script failed') ||
                message.includes('error loading dynamically imported module')
            ) {
                // Prevent infinite reload loops using sessionStorage
                const storageKey = `lazyImport_reload_${window.location.pathname}`;
                const reloaded = sessionStorage.getItem(storageKey);

                if (!reloaded) {
                    console.warn('Chunk load error detected. Reloading page to fetch new version...');
                    sessionStorage.setItem(storageKey, 'true');
                    // Clear the flag after a short delay to allow future errors on the same page to trigger another reload if a *new* deployment happens much later
                    // But for now, just reloading is the main goal.
                    window.location.reload();
                    // Return a never-resolving promise to pause rendering while reloading
                    return new Promise(() => { });
                } else {
                    console.error('Chunk load error persisted after reload.', error);
                    // Optionally clear the flag so it tries again next time the user visits
                    sessionStorage.removeItem(storageKey);
                    throw error;
                }
            } else {
                throw error;
            }
        }
    });
};
