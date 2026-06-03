/** "Jane Doe" → "Jane-Doe" for default Google usernames. */
export function formatNameAsUsername(fullName: string): string {
	return fullName
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export function isGoogleOAuthProvider(provider: string | undefined): boolean {
	if (!provider) return false;
	const p = provider.toLowerCase();
	return p === "google" || p === "oauth_google" || p.includes("google");
}
