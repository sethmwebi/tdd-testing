import { toContainText } from "./matchers/toContainText"
import { toHaveClass } from "./matchers/toHaveClass"
import { toBeElementWithTag } from "./matchers/toBeElementWithTag"

expect.extend({ toContainText, toHaveClass, toBeElementWithTag })