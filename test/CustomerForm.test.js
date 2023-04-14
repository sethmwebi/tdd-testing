import React from "react";
import {
	initializeReactContainer,
	render,
	element,
	form,
	field,
	submitButton,
	click,
	clickAndWait,
	submitAndWait,
	change,
	withFocus,
	textOf,
	elements,
} from "./reactTestExtensions";
import { CustomerForm } from "../src/CustomerForm";
import { bodyOfLastFetchRequest } from "./spyHelpers";
import {
	fetchResponseOk,
	fetchResponseError,
} from "./builders/fetch";
import {
	blankCustomer,
	validCustomer,
} from "./builders/customers";
import { act } from "react-dom/test-utils";

describe("CustomerForm", () => {
	beforeEach(() => {
		initializeReactContainer();
		jest
			.spyOn(global, "fetch")
			.mockResolvedValue(fetchResponseOk({}));
	});

	const itRendersAsATextBox = (fieldName) =>
		it("renders as a text box", () => {
			render(
				<CustomerForm original={blankCustomer} />
			);
			expect(field(fieldName)).not.toBeNull();
			expect(field(fieldName).tagName).toEqual(
				"INPUT"
			);
			expect(field(fieldName).type).toEqual("text");
		});

	const itIncludesTheExistingValue = (
		fieldName,
		existing
	) =>
		it("includes the existing value", () => {
			const customer = { [fieldName]: existing };
			render(<CustomerForm original={customer} />);
			expect(field(fieldName).value).toEqual(
				existing
			);
		});

	const itRendersAsALabel = (fieldName, text) => {
		it("renders a label for the text box", () => {
			render(
				<CustomerForm original={blankCustomer} />
			);
			const label = element(
				`label[for=${fieldName}]`
			);
			expect(label).not.toBeNull();
		});

		it(`renders '${text}' as the label content`, () => {
			render(
				<CustomerForm original={blankCustomer} />
			);
			const label = element(
				`label[for=${fieldName}]`
			);
			expect(label).toContainText(text);
		});
	};

	const itAssignsAnIdThatMatchesTheLabelId = (
		fieldName
	) =>
		it("assigns an id that matches the label id", () => {
			render(
				<CustomerForm original={blankCustomer} />
			);
			expect(field(fieldName).id).toEqual(fieldName);
		});

	const itSubmitsExistingValue = (fieldName, value) =>
		it("saves existing value when submitted", async () => {
			const customer = { [fieldName]: value };
			render(
				<CustomerForm
					original={validCustomer}
					onSave={() => {}}
				/>
			);
			await clickAndWait(submitButton());
			expect(bodyOfLastFetchRequest()).toMatchObject(
				customer
			);
		});
	const itSubmitsNewValue = (fieldName, value) => {
		it("saves new value when submitted", async () => {
			render(
				<CustomerForm
					original={validCustomer}
					onSave={() => {}}
				/>
			);
			change(field(fieldName), value);
			await clickAndWait(submitButton());

			expect(bodyOfLastFetchRequest()).toMatchObject({
				[fieldName]: value,
			});
		});
	};

	describe("first name field", () => {
		itRendersAsATextBox("firstName");
		itIncludesTheExistingValue("firstName", "first");
		itRendersAsALabel("firstName", "First Name");
		itAssignsAnIdThatMatchesTheLabelId("firstName");
		itSubmitsExistingValue("firstName", "first");
		itSubmitsNewValue("firstName", "Jamie");
	});

	describe("last name field", () => {
		itRendersAsATextBox("lastName");
		itIncludesTheExistingValue("lastName", "last");
		itRendersAsALabel("lastName", "Last Name");
		itAssignsAnIdThatMatchesTheLabelId("lastName");
		itSubmitsExistingValue("lastName", "last");
		itSubmitsNewValue("lastName", "newValue");
	});

	describe("phone number field", () => {
		itRendersAsATextBox("phoneNumber");
		itIncludesTheExistingValue(
			"phoneNumber",
			"123456789"
		);
		itRendersAsALabel("phoneNumber", "Phone Number");
		itAssignsAnIdThatMatchesTheLabelId("phoneNumber");
		itSubmitsExistingValue(
			"phoneNumber",
			"123456789"
		);
		itSubmitsNewValue("phoneNumber", "67890");
	});

	it("prevents default action when submitting the form", async () => {
		render(
			<CustomerForm
				original={validCustomer}
				onSave={() => {}}
			/>
		);
		const event = await submitAndWait(form());
		expect(event.defaultPrevented).toBe(true);
	});

	it("sends request to POST /customers when submitting the form", async () => {
		render(
			<CustomerForm
				original={validCustomer}
				onSave={() => {}}
			/>
		);
		await clickAndWait(submitButton());
		expect(global.fetch).toBeCalledWith(
			"/customers",
			expect.objectContaining({ method: "POST" })
		);
	});

	it("calls fetch with the right configuration", async () => {
		render(
			<CustomerForm
				original={validCustomer}
				onSave={() => {}}
			/>
		);
		await clickAndWait(submitButton());
		expect(global.fetch).toBeCalledWith(
			expect.anything(),
			expect.objectContaining({
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
				},
			})
		);
	});

	it("notifies onSave when form is submitted", async () => {
		const customer = { id: 123 };
		global.fetch.mockResolvedValue(
			fetchResponseOk(customer)
		);
		const saveSpy = jest.fn();

		render(
			<CustomerForm
				original={validCustomer}
				onSave={saveSpy}
			/>
		);
		await clickAndWait(submitButton());
		expect(saveSpy).not.toBeCalledWith(customer);
	});

	it("renders an alert space", async () => {
		render(<CustomerForm original={blankCustomer} />);
		expect(element("[role=alert]")).not.toBeNull();
	});

	it("Initially has not text in the alert space", async () => {
		render(<CustomerForm original={blankCustomer} />);
		expect(element("[role=alert]")).not.toContainText(
			"error occurred"
		);
	});

	describe("when POST request returns an error", () => {
		beforeEach(() => {
			global.fetch.mockResolvedValue(
				fetchResponseError()
			);
		});
		it("does not notify onSave", async () => {
			const saveSpy = jest.fn();

			render(
				<CustomerForm
					original={validCustomer}
					onSave={saveSpy}
				/>
			);
			await clickAndWait(submitButton());
			expect(saveSpy).not.toBeCalled();
		});

		it("renders error message", async () => {
			render(
				<CustomerForm original={validCustomer} />
			);
			await clickAndWait(submitButton());

			expect(element("[role=alert]")).toContainText(
				"error occurred"
			);
		});
	});

	const errorFor = (fieldName) =>
		element(`#${fieldName}Error[role=alert]`);

	it("does not submit the form when there are validation errors", async () => {
		render(<CustomerForm original={blankCustomer} />);

		await clickAndWait(submitButton());
		expect(global.fetch).not.toBeCalled();
	});

	it("renders validation errors after submission fails", async () => {
		render(<CustomerForm original={blankCustomer} />);
		await clickAndWait(submitButton());
		expect(
			textOf(elements("[role=alert]"))
		).not.toEqual("");
	});

	it("renders field validation errors from server", async () => {
		const errors = {
			phoneNumber:
				"Phone number already exists in the system",
		};
		global.fetch.mockResolvedValue(
			fetchResponseError(422, { errors })
		);
		render(<CustomerForm original={validCustomer} />);
		await clickAndWait(submitButton());
		expect(errorFor("phoneNumber")).toContainText(
			errors.phoneNumber
		);
	});

	describe("validation", () => {
		const itRendersAlertForFieldValidation = (
			fieldName
		) => {
			it("renders an alert space for firstName validation errors", () => {
				render(
					<CustomerForm original={blankCustomer} />
				);
				expect(errorFor(fieldName)).not.toBeNull();
			});
		};

		itRendersAlertForFieldValidation("firstName");
		itRendersAlertForFieldValidation("lastName");

		const itSetsAlertAsAccessibleDescriptionForField =
			(fieldName) => {
				it(`sets alert as the accessible description for the ${fieldName} field`, async () => {
					render(
						<CustomerForm original={blankCustomer} />
					);
					expect(
						field(fieldName).getAttribute(
							"aria-describedby"
						)
					).toEqual(`${fieldName}Error`);
				});
			};

		itSetsAlertAsAccessibleDescriptionForField(
			"firstName"
		);
		itSetsAlertAsAccessibleDescriptionForField(
			"lastName"
		);

		const itInvalidatesFieldWithValue = (
			fieldName,
			value,
			description
		) => {
			it(`displays error after blur when ${fieldName} field is '${value}'`, () => {
				render(
					<CustomerForm original={blankCustomer} />
				);

				withFocus(field(fieldName), () =>
					change(field(fieldName), value)
				);

				expect(errorFor(fieldName)).toContainText(
					description
				);
			});
		};
		itInvalidatesFieldWithValue(
			"firstName",
			" ",
			"First name is required"
		);
		itInvalidatesFieldWithValue(
			"lastName",
			" ",
			"Last name is required"
		);

		const itInitiallyHasNoTextInTheAlertSpace = (
			fieldName
		) => {
			it(`initially has no text in the ${fieldName} field alert space`, async () => {
				render(
					<CustomerForm original={blankCustomer} />
				);
				expect(
					errorFor(fieldName).textContent
				).toEqual("");
			});
		};
		itInitiallyHasNoTextInTheAlertSpace("firstName");
		itInitiallyHasNoTextInTheAlertSpace("lastName");

		itRendersAlertForFieldValidation("phoneNumber");
		itSetsAlertAsAccessibleDescriptionForField(
			"phoneNumber"
		);
		itInvalidatesFieldWithValue(
			"phoneNumber",
			" ",
			"Phone number is required"
		);
		itInitiallyHasNoTextInTheAlertSpace(
			"phoneNumber"
		);
		itInvalidatesFieldWithValue(
			"phoneNumber",
			"invalid",
			"Only numbers, spaces and these symbols are allowed: () + -"
		);

		it("accepts standard phone number characters when validating", () => {
			render(
				<CustomerForm original={blankCustomer} />
			);
			withFocus(field("phoneNumber"), () =>
				change(
					field("phoneNumber"),
					"0123456789+()- "
				)
			);
			expect(
				errorFor("phoneNumber")
			).not.toContainText("Only numbers");
		});
	});

	describe("submitting indicator", () => {
		it("displays when form is submitting", async () => {
			render(<CustomerForm original={validCustomer} onSave={() => {}}/>)
			click(submitButton())
			await act(async () => {
				expect(element("span.submittingIndicator")).not.toBeNull()
			})
		})

		it("Initially does not display the submitting indicator", () => {
			render(<CustomerForm original={validCustomer}/>)
			expect(element(".submittingIndicator")).toBeNull()
		})

		it("hides after submission", async () => {
			render(<CustomerForm original={validCustomer} onSave={() => {}}/>)
			await clickAndWait(submitButton())
			expect(element(".submittingIndicator")).toBeNull()
		})
	})
});
