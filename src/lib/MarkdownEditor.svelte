<script lang="ts">
	import type EasyMDEType from "easymde";
	import "easymde/dist/easymde.min.css";
	import { onDestroy, onMount } from "svelte";

	export let value: string = "";

	let ref!: HTMLTextAreaElement;

	let editor: EasyMDEType;

	onMount(async () => {
		const EasyMDE = await import("easymde").then((m) => m.default);

		editor = new EasyMDE({
			element: ref,
			status: false,
			unorderedListStyle: "-",
			spellChecker: false,
			toolbar: ["bold", "italic", "heading", "|", "unordered-list", "ordered-list", "|", "guide"],
			minHeight: `${window.innerHeight - 71}px`,
		});

		editor.value(value);
		editor.codemirror.on("change", (instance, changeObj) => {
			const next = instance.getValue();
			if (changeObj.origin !== "setValue" && !next.includes("�")) {
				value = next;
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.cleanup();
			editor.toTextArea();
		}
	});
</script>

<textarea class="h-full w-full" bind:this={ref} />
