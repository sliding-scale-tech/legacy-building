/** Legacy Building design tokens (from Bubble app) */
export const brand = {
	primary: "#008080",
	primaryRgb: "0, 128, 128",
	pageBackground: "#ebf6f6",
	text: "#1a1a1a",
	textMuted: "#8a8a8a",
	border: "#c7c7c7",
	borderLight: "#e6e6e6",
	navInactive: "#c7c7c7",
	footerBg: "#f2f2f2",
	white: "#ffffff",
	libraryMint: "#ebf6f6",
	librarySidebarBg: "#f7f7f7",
	sidebarDateMuted: "#a6a6a6",
	entryDetailPanelBg: "#ffffff",
	dateMuted: "#f2f2f2",
	textSecondary: "#a6a6a6",
	destructive: "#b0200c",
	alert: "#dca114",
	alertLight: "#fff4db",
	overlay: "rgba(82, 82, 82, 0.6)",
	cancelBg: "#f2f2f2",
	cancelText: "#525252",
} as const;

export const dashboardLayout = {
	headerMinHeight: 80,
	contentMarginTop: 80,
	contentPaddingX: 40,
	contentPaddingY: 20,
	innerMaxWidth: 1200,
	headerPaddingLeft: 29,
	headerPaddingRight: 40,
	heroRadius: 20,
	heroMinHeight: 500,
	heroPaddingX: 40,
	heroPaddingBottom: 20,
	profileSize: 200,
	profileBorder: 5,
	headerAvatarSize: 50,
	headerAvatarMinWidth: 200,
	logoWidth: 200,
	logoHeight: 50,
} as const;

export const assets = {
	favicon:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=128,h=,f=auto,dpr=1,fit=contain/f1775019895521x225525945447615700/favicon.png",
	logo: "https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=384,h=384,f=auto,dpr=2,fit=contain/f1777634183357x710043754012557300/logo_LB.png",
	heroBackground:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=1024,h=738,f=auto,dpr=1,fit=cover/f1770806706801x964274406078293100/IMG_3497%20%282%29.PNG",
	heroPanelImage:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=cover/f1773403070196x543437914641407000/IMG_3497.png",
	authPanelBackground:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=768,h=914,f=auto,dpr=2,fit=cover/f1773403070196x543437914641407000/IMG_3497.png",
	loaderLottie:
		"https://lottie.host/439c6a07-3c1e-46a5-9107-95e5ea9e86c5/tmOWSnHsPq.lottie",
	whiteLogo:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=256,h=64,f=auto,dpr=1,fit=contain/f1777634217219x976320664399768200/whiteLogoLB.png",
	headerBackground:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=1024,h=100,f=auto,dpr=1,fit=cover/f1774421734621x161689535048876960/IMG_3497.png",
	deskHeroBackground:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1774947605183x695916817017497500/web%20app%20image.jpg.jpeg",
	defaultAvatar:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=256,h=256,f=auto,dpr=1,fit=contain/f1774343501215x970779483795198500/3608-unknown.png",
	headerAvatar:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=64,h=64,f=auto,dpr=1,fit=cover/f1774343501215x970779483795198500/3608-unknown.png",
	libraryEmptyImage:
		"https://80f7ebbdfe50de63f29ee1570f54307b.cdn.bubble.io/cdn-cgi/image/w=384,h=384,f=auto,dpr=0.75,fit=contain/f1754531502990x582120008401293600/transparant%20image.webp",
} as const;

/** In-app legal routes (web). Native apps should open the same paths on their web host. */
export const legalRoutes = {
	terms: "/terms",
	privacy: "/privacy",
} as const;

export const youtube = {
	welcomeVideoId: "xFus-G0NNqI",
} as const;
