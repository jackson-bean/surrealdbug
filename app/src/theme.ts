import { ActionIcon, Alert, Checkbox, createTheme, Drawer, HoverCard, Indicator, Modal, Overlay, Paper, Popover, Radio, rem, Select, Slider, Switch, Tabs, TagsInput, TextInput, Tooltip } from "@mantine/core";
import { SpotlightAction, SpotlightRoot } from "@mantine/spotlight";
import classes from "./theme.module.css";

export const THEME = createTheme({
	fontFamily: `-apple-system, ui-sans-serif, system-ui, Inter, "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
	fontFamilyMonospace: `JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
	primaryColor: "surreal",
	primaryShade: 6,
	defaultRadius: "md",
	// fontSizes: {
	// 	xs: rem(10),
	// 	sm: rem(11),
	// 	md: rem(12),
	// 	lg: rem(14),
	// 	xl: rem(16),
	// },
	// headings: {
	// 	sizes: {
	// 		h1: { fontSize: rem(22), fontWeight: "700" },
	// 		h2: { fontSize: rem(20), fontWeight: "600" },
	// 		h3: { fontSize: rem(18), fontWeight: "500" },
	// 	},
	// },
	// spacing: {
	// 	xs: rem(6),
	// 	sm: rem(9),
	// 	md: rem(12),
	// 	lg: rem(16),
	// 	xl: rem(20),
	// },
	// radius: {
	// 	xs: rem(7),
	// 	sm: rem(9),
	// 	md: rem(11),
	// 	lg: rem(15),
	// 	xl: rem(19),
	// },
	colors: {
		surreal: [
			"#ffe8fb",
			"#ffcfef",
			"#ff9bda",
			"#ff64c5",
			"#fe38b4",
			"#fe1ca9",
			"#ff00a0",
			"#e4008e",
			"#cc007f",
			"#b3006f",
		],
		slate: [
			"#F5F5F7",
			"#E8E7ED",
			"#DDDCE4",
			"#A19FAC",
			"#878495",
			"#575466",
			"#272438",
			"#1D1A28",
			"#16141F",
			"#0E0C14",
		],
	},
	defaultGradient: {
		from: "surreal",
		to: "#9600FF",
		deg: 135,
	},
	components: {
		Paper: Paper.extend({
			defaultProps: {
				withBorder: true,
				radius: "sm",
			},
		}),
		Modal: Modal.extend({
			defaultProps: {
				withCloseButton: false,
				padding: 24,
			}
		}),
		Overlay: Overlay.extend({
			defaultProps: {
				blur: 5,
				color: "#0E0C14",
			},
		}),
		Popover: Popover.extend({
			defaultProps: {
				shadow: "0 6px 12px 2px rgba(0, 0, 0, 0.15)",
			},
		}),
		ActionIcon: ActionIcon.extend({
			defaultProps: {
				variant: "light",
				color: "slate",
				radius: "xs",
			},
		}),
		Select: Select.extend({
			defaultProps: {
				allowDeselect: false,
			},
		}),
		Radio: Radio.extend({
			styles: {
				label: {
					display: "block",
				},
			},
		}),
		Slider: Slider.extend({
			defaultProps: {
				color: "slate.2",
			},
		}),
		Tabs: Tabs.extend({
			defaultProps: {
				variant: "pills",
			},
			styles: {
				tab: {
					fontWeight: 600,
					minHeight: 30,
				},
			},
		}),
		Checkbox: Checkbox.extend({
			defaultProps: {
				color: "transparent",
				radius: 5,
			},
		}),
		Switch: Switch.extend({
			styles: {
				root: {
					display: "flex",
				},
			},
		}),
		Indicator: Indicator.extend({
			styles: {
				root: {
					zIndex: 0,
				},
			},
		}),
		TagsInput: TagsInput.extend({
			styles: {
				input: {
					display: "flex",
				},
			},
		}),
		TextInput: TextInput.extend({
			defaultProps: {
				spellCheck: false,
			},
		}),
		Alert: Alert.extend({
			styles: {
				title: {
					fontSize: "var(--mantine-font-size-md)",
				},
				message: {
					fontSize: "var(--mantine-font-size-md)",
				},
			},
		}),
		Tooltip: Tooltip.extend({
			defaultProps: {
				transitionProps: { transition: "pop" },
				withArrow: true,
				arrowSize: 10,
				radius: "xs",
			},
		}),
		Drawer: Drawer.extend({
			defaultProps: {
				withCloseButton: false,
				padding: "xl",
				offset: 14,
				radius: "md",
			},
			styles: {
				inner: {
					inset: 0,
					width: "unset",
				},
			},
		}),
		HoverCard: HoverCard.extend({
			defaultProps: {
				arrowOffset: 8,
			},
		}),
		SpotlightAction: SpotlightAction.extend({
			defaultProps: {
				classNames: {
					action: classes.action
				}
			}
		}),
	},
});