
/**
 * Cleans HTML content to reduce token usage for AI processing.
 * Removes scripts, styles, comments, and unnecessary attributes.
 * PRESERVES application/ld+json which contains vital structured data.
 */
export function cleanHtmlForAi(html: string): string {
    if (!html) return '';

    // 0. Extract and preserve JSON-LD blocks
    // Many real estate sites use JSON-LD for rich snippets (structured property data)
    const jsonLdBlocks: string[] = [];
    const jsonLdRegex = /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
        jsonLdBlocks.push(match[0]); // Keep the whole tag
    }

    // 1. Remove script and style tags and their content
    let cleaned = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');
    cleaned = cleaned.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
    cleaned = cleaned.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');

    // 2. Remove comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // 3. Remove base64 images (data:image/...) to save massive space
    // Be careful not to break the structure, just replace content
    cleaned = cleaned.replace(/src="data:image\/[^"]+"/g, 'src="[base64-removed]"');
    cleaned = cleaned.replace(/srcset="data:image\/[^"]+"/g, 'srcset="[base64-removed]"');
    cleaned = cleaned.replace(/background-image:\s*url\('data:image\/[^']+'\)/g, 'background-image: url([base64-removed])');

    // 4. Remove unnecessary attributes that don't contain property info
    // Keep: id, class, src, href, alt, title, data-*, aria-label
    // Remove: on*, style (except background-image), width, height, fill, stroke, etc.
    cleaned = cleaned.replace(/\s(on\w+|fill|stroke|d|points|viewBox)="[^"]*"/gi, '');

    // 5. Compress whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // 6. Append preserved JSON-LD blocks at the end
    // This gives the AI high-quality structured data to work with
    if (jsonLdBlocks.length > 0) {
        // Add a clear separator for the AI
        cleaned += `\n\n<!-- EXTRACTED STRUCTURED DATA -->\n${jsonLdBlocks.join('\n')}`;
    }

    // 7. Truncate if still too large (hard limit for GPT-4o-mini context)
    // 128k tokens is roughly 400-500k chars. Let's send max 300k chars to be safe
    const MAX_HTML_LENGTH = 300000;
    if (cleaned.length > MAX_HTML_LENGTH) {
        console.warn(`⚠️ HTML cleaned but still too large (${cleaned.length} chars). Truncating to ${MAX_HTML_LENGTH} chars.`);
        cleaned = cleaned.substring(0, MAX_HTML_LENGTH);
    }

    return cleaned;
}
