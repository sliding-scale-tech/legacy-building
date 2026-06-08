import { Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { MyStoryEntry } from "@/components/my-story-pdf/types";

const TEAL = "#007A7A";

const styles = StyleSheet.create({
	page: {
		paddingTop: 0,
		paddingHorizontal: 40,
		paddingBottom: 40,
	},
	headerBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: TEAL,
		height: 32,
		paddingHorizontal: 20,
		marginHorizontal: -40,
		marginTop: 0,
		marginBottom: 24,
	},
	headerSpacer: {
		flex: 1,
	},
	headerJournalName: {
		color: "#ffffff",
		fontSize: 11,
		fontFamily: "Helvetica",
	},
	photoWrap: {
		alignItems: "center",
	},
	photo: {
		width: 260,
		height: 200,
		objectFit: "cover",
	},
	photoPlaceholder: {
		width: 260,
		height: 200,
		backgroundColor: "#e8e8e8",
	},
	heading: {
		fontFamily: "Times-Bold",
		fontSize: 16,
		color: "#111111",
		textAlign: "center",
		marginTop: 14,
	},
	date: {
		fontFamily: "Times-Italic",
		fontSize: 10,
		color: "#888888",
		textAlign: "center",
		marginTop: 4,
	},
	body: {
		fontFamily: "Helvetica",
		fontSize: 11,
		color: "#222222",
		lineHeight: 1.6,
		marginTop: 14,
		textAlign: "left",
	},
});

type EntryPageProps = MyStoryEntry & {
	journalName: string;
};

export function EntryPage({
	heading,
	date,
	body,
	imageBase64,
	journalName,
}: EntryPageProps) {
	return (
		<Page size="A4" style={styles.page}>
			<View style={styles.headerBar}>
				<View style={styles.headerSpacer} />
				<Text style={styles.headerJournalName}>{journalName}</Text>
			</View>
			<View style={styles.photoWrap}>
				{imageBase64 ? (
					<Image src={imageBase64} style={styles.photo} />
				) : (
					<View style={styles.photoPlaceholder} />
				)}
			</View>
			<Text style={styles.heading}>{heading}</Text>
			<Text style={styles.date}>{date}</Text>
			{body.trim() ? <Text style={styles.body}>{body.trim()}</Text> : null}
		</Page>
	);
}
