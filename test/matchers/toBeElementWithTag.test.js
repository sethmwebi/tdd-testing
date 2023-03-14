import { toBeElementWithTag } from "./toBeElementWithTag";

describe("toBeElementWithTag matcher", () => {
	const stripTerminalColor = text =>     text.replace(/\x1B\[\d+m/g, "");
	const elementForm = text => {
		const parent = document.createElement("div")
		parent.innerHTML = text;
		return parent.firstChild;
	}

	it("returns pass is true when element of the right tag is found", () => {
		const domElement = elementForm("<input />")
		const result = toBeElementWithTag(domElement, "input");
		expect(result.pass).toBe(true);
	})

	it("returns pass is false when the element is null", () => {
		const result = toBeElementWithTag(null, "input");
		expect(result.pass).toBe(false)
	})

	it("returns pass is false when the element is the wrong tag", () => {
		const domElement = elementForm("<input />")
		const result = toBeElementWithTag(domElement, "select");
		expect(result.pass).toBe(false)
	})

	it("returns a message that contains the source line if no match", () => {
		const domElement = elementForm("<input />")
		const result = toBeElementWithTag(domElement, "select");
		expect(stripTerminalColor(result.message())).toMatch(`expect(element).toBeElementWithTag("select")`)
	})
})