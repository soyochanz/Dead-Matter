import React, { lazy } from 'react';

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
                    // Instead of throwing and crashing, return a fallback component that allows manual retry
                    return {
                        default: () => React.createElement('div', {
                            style: { padding: '20px', textAlign: 'center', color: '#ef4444' }
                        }, [
                            React.createElement('p', { key: 'error-msg' }, 'Error loading component. Please check your connection.'),
                            React.createElement('button', {
                                key: 'retry-btn',
                                onClick: () => {
                                    sessionStorage.removeItem(storageKey);
                                    window.location.reload();
                                },
                                style: {
                                    marginTop: '10px',
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }
                            }, 'Try Again')
                        ])
                    };
                }
            } else {
                throw error;
            }
        }
    });
};
