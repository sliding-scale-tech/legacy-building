export function navigateAfterAuth(
	navigate: (options: { to: string }) => void,
	url: string,
) {
	if (url.startsWith("http")) {
		window.location.href = url;
		return;
	}
	navigate({ to: url });
}

export function navigateTo(
	navigate: (options: { to: string }) => void,
	href: string,
) {
	navigate({ to: href });
}
