import { toContainText } from "./matchers/toContainText";
import { toHaveClass } from "./matchers/toHaveClass";
import { toBeElementWithTag } from "./matchers/toBeElementWithTag";
import { toBeRenderedWithProps, toBeFirstRenderedWithProps } from "./matchers/toBeRenderedWithProps";

expect.extend({
	toContainText,
	toHaveClass,
	toBeElementWithTag,
	toBeRenderedWithProps,
	toBeFirstRenderedWithProps
});
