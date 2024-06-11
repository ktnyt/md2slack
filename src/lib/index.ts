import type { List, ListItem, Paragraph, PhrasingContent, Root } from "mdast";

function arraySplit<T>(array: T[], predicate: (value: T) => boolean): T[][] {
	const index = array.findIndex(predicate);
	if (index === -1) {
		return [array];
	}
	return [array.slice(0, index), ...arraySplit(array.slice(index + 1), predicate)];
}

function extractText(contents: PhrasingContent[]): string {
	return contents
		.map((content) => {
			switch (content.type) {
				case "text":
					return content.value;
				case "strong":
				case "emphasis":
				case "delete":
				case "link":
					return extractText(content.children);
				default:
					return "";
			}
		})
		.join("");
}

type RichTextSectionElement =
	| {
			type: "text";
			text: string;
			style?: {
				bold?: boolean;
				italic?: boolean;
				strike?: boolean;
			};
	  }
	| {
			type: "link";
			text: string;
			url: string;
	  };

function convertParagraph(paragraph: Paragraph): RichTextSectionElement[] {
	return paragraph.children
		.filter((child) => ["text", "strong", "emphasis", "delete", "link"].includes(child.type))
		.map((child) => {
			switch (child.type) {
				case "text":
					return {
						type: "text",
						text: child.value,
					};

				case "strong":
					return {
						type: "text",
						text: extractText(child.children),
						style: {
							bold: true,
						},
					};

				case "emphasis":
					return {
						type: "text",
						text: extractText(child.children),
						style: {
							italic: true,
						},
					};

				case "delete":
					return {
						type: "text",
						text: extractText(child.children),
						style: {
							strike: true,
						},
					};

				case "link":
					return {
						type: "link",
						text: extractText(child.children),
						url: child.url,
					};

				default:
					throw new Error(`Unexpected child type: ${child.type}`);
			}
		});
}

type SlackListStyle = "ordered" | "bullet";

type RichTextSection = {
	type: "rich_text_section";
	elements: RichTextSectionElement[];
};

type RichTextList = {
	type: "rich_text_list";
	style: SlackListStyle;
	elements: RichTextSection[];
	indent: number;
};

function flattenListItem(item: ListItem, style: SlackListStyle, indent: number): RichTextList[] {
	return item.children.flatMap((child) => {
		switch (child.type) {
			case "paragraph":
				return {
					type: "rich_text_list",
					style,
					elements: [{ type: "rich_text_section", elements: convertParagraph(child) }],
					indent,
				};

			case "list":
				return flattenList(child, indent + 1);

			default:
				return [];
		}
	});
}

function flattenList(list: List, indent = 0): RichTextList[] {
	return list.children
		.flatMap((item) => flattenListItem(item, list.ordered ? "ordered" : "bullet", indent))
		.reduce((acc, item) => {
			if (acc.length === 0) {
				return [item];
			}

			const lastItem = acc[acc.length - 1];
			if (lastItem.indent === item.indent) {
				lastItem.elements.push(...item.elements);
			} else {
				acc.push(item);
			}

			return acc;
		}, [] as RichTextList[]);
}

export function md2slack(root: Root) {
	return root.children.flatMap((content): any => {
		switch (content.type) {
			case "heading":
				return [
					{
						type: "header",
						text: {
							type: "plain_text",
							text: extractText(content.children),
							emoji: true,
						},
					},
				];

			case "paragraph":
				const sections = arraySplit(content.children, (child) => child.type === "break");
				return [
					{
						type: "rich_text",
						elements: sections.map((section) => ({
							type: "rich_text_section",
							elements: section.map((child) => {
								switch (child.type) {
									case "text":
										return {
											type: "text",
											text: child.value,
										};

									case "strong":
										return {
											type: "text",
											text: extractText(child.children),
											style: {
												bold: true,
											},
										};

									case "emphasis":
										return {
											type: "text",
											text: extractText(child.children),
											style: {
												italic: true,
											},
										};

									case "delete":
										return {
											type: "text",
											text: extractText(child.children),
											style: {
												strike: true,
											},
										};

									case "link":
										return {
											type: "link",
											text: extractText(child.children),
											url: child.url,
										};
								}
							}),
						})),
					},
				];

			case "list":
				return flattenList(content).map((elements) => ({
					type: "rich_text",
					elements: [elements],
				}));
		}
	});
}
