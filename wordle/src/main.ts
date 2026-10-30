import { mount } from "svelte";
import App from "./App.svelte";

const app = mount(App, {
	target: document.body,
	props: {
		version: "1.0.6",
		AIRAC: "2611"
	}
});

export default app;