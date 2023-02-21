import { toBeInputFieldOfType } from "./toBeInputFieldOfType";

describe("toBeInputFieldOfType matcher", () => {
	const stripTerminalColor = (text) => text.replace(/\x1B\[\d+m/g, "");

	const elementForm = (text) => {
		const parent = document.createElement("div");
		parent.innerHTML = text;
		return parent.firstChild;
	};

	it("returns pass is true when input element of the right type is found", () => {
		const domElement = elementForm("<input type=text />");
		const result = toBeInputFieldOfType(domElement, "text");
		expect(result.pass).toBe(true);
	});

	it("returns pass is false when the element is null", () => {
		const result = toBeInputFieldOfType(null, "text");
		expect(result.pass).toBe(false);
	});

	it("returns pass is false when the element is the wrong tag", () => {
		const domElement = elementForm("<p />");
		const result = toBeInputFieldOfType(domElement, "text");
		expect(result.pass).toBe(false);
	});

	it("returns pass is false when the input element is of the wrong type", () => {
		const domElement = elementForm("<input type=date />");
		const result = toBeInputFieldOfType(domElement, "text");
		expect(result.pass).toBe(false);
	});

	it("returns a message that contains the source line if no match", () => {
		const domElement = elementForm("<input type=date />");
		const result = toBeInputFieldOfType(domElement, "text");
		expect(stripTerminalColor(result.message())).toMatch(
			`expect(element).toBeInputFieldOfType("text")`
		);
	});

	it("returns a message that contains the source line if negated match", () => {
		const domElement = elementForm("<input type=text />");
		const result = toBeInputFieldOfType(domElement, "text");
		expect(stripTerminalColor(result.message())).toMatch(
			`expect(element).not.toBeInputFieldOfType("text")`
		);
	});

	it("returns a specific message the element passed is null", () => {
		const result = toBeInputFieldOfType(null, "text");
		expect(stripTerminalColor(result.message())).toMatch(
			`Actual: element was not found`
		);
	});

	it("returns a message when the element has a wrong tag", () => {
		const domElement = elementForm("<p />");
		const result = toBeInputFieldOfType(domElement, "text");
		expect(stripTerminalColor(result.message())).toMatch("Actual: <p>");
	});

	it("returns a message when the input element has the wrong type", () => {
		const domElement = elementForm("<input type=date />");
		const result = toBeInputFieldOfType(domElement, "text");
		expect(stripTerminalColor(result.message())).toMatch(
			`Actual: <input type=date>`
		);
	});
});
