/**
 * Dynamic resource hints utility
 * Injects preload links for critical chunks based on environment
 */

import logger from './logger';

// Critical chunks that should be preloaded in production
// const CRITICAL_CHUNKS = {
//     scripts: [
//         'vendor-react',
//         'index'
//     ],
//     styles: [
//         'index',
//         'landing'
//     ]
// };

// Add preload link to document head
function addPreload(href: string, as: string) {
    if (document.querySelector(`link[href="${href}"]`)) {
        return; // Already exists
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;

    if (as === 'style') {
        (link as HTMLLinkElement).onload = function () {
            (this as HTMLLinkElement).onload = null;
            (this as HTMLLinkElement).rel = 'stylesheet';
        };
    }

    document.head.appendChild(link);
}

// Get current page path to determine which chunks are needed
function getCurrentPage(): string {
    const path = window.location.pathname;
    if (path === '/' || path.includes('landing')) return 'landing';
    if (path.includes('solar-map')) return 'solar-map';
    return 'unknown';
}

// Find chunk files that are NOT already loaded
function findChunkFilesToPreload(_pattern: string): string[] { // Renamed parameter to indicate unused
    const scripts = Array.from(document.scripts);
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    const loadedSources: Set<string> = new Set([
        ...scripts.map(s => s.src).filter(Boolean),
        ...links.map(l => (l as HTMLLinkElement).href).filter(Boolean)
    ]);

    // Find potential chunk files in the build manifest (if available) or known patterns
    const potentialFiles: string[] = [];

    // Try to find files by checking common build patterns
    // const baseUrl = window.location.origin; // Unused variable

    // This is a simplified approach - in practice you'd want to use Vite's manifest
    // For now, we'll be conservative and only preload what we're confident about
    return potentialFiles.filter(file => !loadedSources.has(file));
}

// Initialize resource hints
export function initResourceHints() {
    // Only in production - development has different chunk names
    if (import.meta.env.DEV) {
        logger.debug('[Resource Hints] Skipped in development');
        return;
    }

    logger.info('[Resource Hints] 🚀 Initializing critical resource preloads...');

    const currentPage = getCurrentPage();
    logger.debug(`[Resource Hints] Current page detected as: ${currentPage}`);

    // Only preload resources that are likely to be needed for the current page
    // This is a conservative approach to avoid duplicate loading

    // For landing page, preload landing-specific CSS if not already loaded
    if (currentPage === 'landing') {
        const landingLink = document.querySelector('link[href*="landing"]');
        if (!landingLink) {
            // Try to preload landing CSS if we can find it
            const landingCss = document.querySelector('link[href*="index"]')?.getAttribute('href')?.replace('index', 'landing');
            if (landingCss) {
                addPreload(landingCss, 'style');
                logger.debug(`[Resource Hints] Preloaded landing CSS`);
            }
        }
    }

    // For solar map page, we could preload map-related chunks here
    if (currentPage === 'solar-map') {
        // Future: Preload map-specific chunks when identified
        logger.debug('[Resource Hints] Solar map page detected - no specific preloads configured');
    }
}

// Manual preload for specific chunks
export function preloadChunk(name: string, type: 'script' | 'style' = 'script') {
    const pattern = type === 'script' ? `${name}.js` : `${name}.css`;
    const files = findChunkFilesToPreload(pattern);

    files.forEach((file: string) => {
        addPreload(file, type);
    });
}