import { mount } from "svelte";
import App from "./App.svelte";

const app = mount(App, {
	target: document.body,
	props: {
		version: "1.0.5",
		AIRAC: "2610"
	}
});

export default app;