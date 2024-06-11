<script lang="ts">
	import hljs from "highlight.js";
	import json from "highlight.js/lib/languages/json";
	import "highlight.js/styles/github.css";

	hljs.registerLanguage("json", json);

	export let value = "";
</script>

<pre class="m-2 bg-slate-50 p-2">
  <code>
{@html hljs.highlight(value, { language: "json" }).value}
  </code>
</pre>
