<script lang="ts">
	import hljs from "highlight.js";
	import json from "highlight.js/lib/languages/json";
	import "highlight.js/styles/github.css";

	hljs.registerLanguage("json", json);

	export let value = "";
</script>

<pre>
  <code>
{@html hljs.highlight(value, { language: "json" }).value}
  </code>
</pre>
