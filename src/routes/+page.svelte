<script lang="ts">
	import { md2slack } from "$lib";
	import JsonViewer from "$lib/JsonViewer.svelte";
	import MarkdownEditor from "$lib/MarkdownEditor.svelte";
	import remarkBreaks from "remark-breaks";
	import remarkParse from "remark-parse";
	import { unified } from "unified";

	let markdown =
		"# Hello, world! :earth_asia:\n\nThis is some sample text.\nDo you like **bold** or *italic* text?\n\n1. Enter your text\n2. Copy to clipboard\n3. Profit!\n\t- Tip: preview in [block kit builder](https://app.slack.com/block-kit-builder/T25JPTN0M#%7B%7D)!";

	$: json = JSON.stringify(
		{
			blocks: md2slack(unified().use(remarkParse).use(remarkBreaks).parse(markdown)),
		},
		null,
		2,
	);

	function handleCopy() {
		navigator.clipboard.writeText(json);
		alert("Copied to clipboard!");
	}
</script>

<div class="grid h-screen w-screen grid-cols-2">
	<MarkdownEditor bind:value={markdown} />
	<div>
		<div>
			<button
				class=" h-8 w-full cursor-pointer select-none items-center justify-center rounded border border-solid border-blue-500 bg-blue-500/0 p-2 text-base leading-4 text-blue-500 transition hover:bg-blue-500/20 focus:outline-none active:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
				on:click={handleCopy}
			>
				Copy to clipboard
			</button>
		</div>
		<div class="">
			<JsonViewer value={json} />
		</div>
	</div>
</div>
