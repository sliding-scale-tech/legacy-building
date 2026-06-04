import type { ReactNode } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

type AuthFieldProps = TextInputProps & {
	label?: string;
	hideLabel?: boolean;
	error?: string;
	helper?: ReactNode;
};

export function AuthField({
	label,
	hideLabel,
	error,
	helper,
	className,
	value,
	...inputProps
}: AuthFieldProps) {
	return (
		<View className="gap-2">
			{hideLabel || !label ? null : (
				<Text className="font-medium text-base text-primary-foreground">
					{label}
				</Text>
			)}
			<TextInput
				{...inputProps}
				value={value ?? ""}
				className={`h-12 rounded-xl bg-background px-4 text-base text-foreground ${className ?? ""}`}
				placeholderTextColor="#9ca3af"
			/>
			{helper}
			{error ? <Text className="text-red-300 text-xs">{error}</Text> : null}
		</View>
	);
}
