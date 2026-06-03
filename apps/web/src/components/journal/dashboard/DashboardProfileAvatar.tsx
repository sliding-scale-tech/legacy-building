import { assets, dashboardLayout } from "@legacy-building/ui/lib/brand-journal";
import { cn } from "@legacy-building/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarImage } from "@/components/journal/ui/avatar";

type DashboardProfileAvatarProps = {
	src?: string;
	size: "header" | "desk";
	className?: string;
	onClick?: () => void;
	accountHref?: string;
};

export function DashboardProfileAvatar({
	src = assets.defaultAvatar,
	size,
	className,
	onClick,
	accountHref,
}: DashboardProfileAvatarProps) {
	if (size === "header") {
		const imageStyle = {
			width: dashboardLayout.headerAvatarSize,
			height: dashboardLayout.headerAvatarSize,
			backgroundImage: `url("${src}")`,
		};
		const sharedClass = cn(
			"shrink-0 cursor-pointer rounded-full border border-[#e6e6e6]",
			"bg-center bg-cover bg-no-repeat",
			className,
		);

		if (accountHref) {
			return (
				<Link
					to={accountHref}
					className={sharedClass}
					style={imageStyle}
					aria-label="Open account"
				/>
			);
		}

		return (
			<button
				type="button"
				onClick={onClick}
				className={sharedClass}
				style={imageStyle}
				aria-label="Open account"
			/>
		);
	}

	return (
		<Avatar
			className={cn(
				"size-[clamp(7.5rem,32vw,12.5rem)] shrink-0 border-[#008080] bg-white",
				"border-[3px] sm:border-4 md:border-[5px]",
				"after:border-0",
				className,
			)}
		>
			<AvatarImage
				src={src}
				alt="Profile"
				className="object-cover object-center"
			/>
		</Avatar>
	);
}
