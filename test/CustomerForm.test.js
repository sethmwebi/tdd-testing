import React from "react";
import {
	initializeReactContainer,
	render,
	element,
	form,
	field,
	submit,
	submitButton,
	clickAndWait,
	submitAndWait,
	change,
} from "./reactTestExtensions";
import { CustomerForm } from "../src/CustomerForm";
import { bodyOfLastFetchRequest } from "./spyHelpers";
import { fetchResponseOk, fetchResponseError } from "./builders/fetch";
import { blankCustomer } from "./builders/customers";

describe("CustomerForm", () => {
	beforeEach(() => {
		initializeReactContainer();
		jest.spyOn(global, "fetch").mockResolvedValue(fetchResponseOk({}))
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
					original={customer}
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
					original={blankCustomer}
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
		itIncludesTheExistingValue("firstName", "Ashley");
		itRendersAsALabel("firstName", "First Name");
		itAssignsAnIdThatMatchesTheLabelId("firstName");
		itSubmitsExistingValue("firstName", "Ashley");
		itSubmitsNewValue("firstName", "Jamie");
	});

	describe("last name field", () => {
		itRendersAsATextBox("lastName");
		itIncludesTheExistingValue(
			"lastName",
			"existingValue"
		);
		itRendersAsALabel("lastName", "Last Name");
		itAssignsAnIdThatMatchesTheLabelId("lastName");
		itSubmitsExistingValue(
			"lastName",
			"existingValue"
		);
		itSubmitsNewValue("lastName", "newValue");
	});

	describe("phone number field", () => {
		itRendersAsATextBox("phoneNumber");
		itIncludesTheExistingValue(
			"phoneNumber",
			"12345"
		);
		itRendersAsALabel("phoneNumber", "Phone Number");
		itAssignsAnIdThatMatchesTheLabelId("phoneNumber");
		itSubmitsExistingValue("phoneNumber", "12345");
		itSubmitsNewValue("phoneNumber", "67890");
	});

	it("prevents default action when submitting the form", async () => {
		render(
			<CustomerForm
				original={blankCustomer}
				onSave={() => {}}
			/>
		);
		const event = await submitAndWait(form());
		expect(event.defaultPrevented).toBe(true);
	});

	it("sends request to POST /customers when submitting the form", async () => {
		render(
			<CustomerForm
				original={blankCustomer}
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
				original={blankCustomer}
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
		const saveSpy = jest.fn()

		render(
			<CustomerForm
				original={customer}
				onSave={saveSpy}
			/>
		);
		await clickAndWait(submitButton());
		expect(saveSpy).toBeCalledWith(customer);
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
			global.fetch.mockResolvedValue(fetchResponseError())
		})
		it("does not notify onSave", async () => {
			const saveSpy = jest.fn()

			render(
				<CustomerForm
					original={blankCustomer}
					onSave={saveSpy}
				/>
			);
			await clickAndWait(submitButton());
			expect(saveSpy).not.toBeCalled();
		});

		it("renders error message", async () => {
			render(
				<CustomerForm original={blankCustomer} />
			);
			await clickAndWait(submitButton());

			expect(element("[role=alert]")).toContainText(
				"error occurred"
			);
		});
	});
});
