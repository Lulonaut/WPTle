//! IF ANYTHING IN THIS FILE IS CHANGED MAKE SURE setVersion.js HAS ALSO BEEN UPDATED
import { mount } from "svelte";
import App from "./App.svelte";

const app = mount(App, {
	target: document.body,
	props: {
		version: "1.0.1",
		AIRAC: "2610"
	}
});

export default app;