import React from "react"
import { Appointment, AppointmentsDayView } from "../src/AppointmentsDayView";
import { initializeReactContainer, container, render, click, element, elements, textOf, typesOf } from "./reactTestExtensions"

describe("Appointment", () => {
	const blankCustomer = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
  };

	beforeEach(() => {
		initializeReactContainer()
	});

	const appointmentTable = () => element("#appointmentView > table")

	it("renders a table", () => {
		render(<Appointment customer={blankCustomer}/>)
		expect(appointmentTable()).not.toBeNull()
	})

	it("renders the customer first name", () => {
		const customer = { firstName: "Ashley" };
		render(<Appointment customer={customer} />);
		expect(appointmentTable()).toContainText("Ashley");
	});

	it("renders another customer first name", () => {
		const customer = { firstName: "Jordan" };
		render(<Appointment customer={customer} />);
		expect(appointmentTable()).toContainText("Jordan");
	});
});

describe("AppointmentsDayView", () => {

	const today = new Date();
	const twoAppointments = [
		{ startsAt: today.setHours(12, 0), customer: { firstName: "Ashley" } },
		{ startsAt: today.setHours(13, 0), customer: { firstName: "Jordan" } },
	];

	beforeEach(() => {
		initializeReactContainer()
	});

	const secondButton = () => elements("button")[1];

	it("renders a div with the right id", () => {
		render(<AppointmentsDayView appointments={[]} />);
		expect(element("div#appointmentsDayView")).not.toBeNull();
	});

	it("renders an ol element to display appointments", () => {
		render(<AppointmentsDayView appointments={[]} />);
		expect(element("ol")).not.toBeNull()
	});

	it("renders an li for each appointment", () => {
		render(<AppointmentsDayView appointments={twoAppointments} />);

		const listChildren = elements("ol > li");
		expect(listChildren).toHaveLength(2);
	});

	it("renders the time for each appointment", () => {
		render(<AppointmentsDayView appointments={twoAppointments} />);

		const listChildren = elements("li");
		expect(textOf(elements("li"))).toEqual(["12:00", "13:00"])
	});

	it("initially shows a message sayng there are no appointments today", () => {
		render(<AppointmentsDayView appointments={[]} />);
		expect(document.body).toContainText(
			"There are no appointments scheduled for today."
		);
	});

	it("selects the first appointment by default", () => {
		render(<AppointmentsDayView appointments={twoAppointments} />);

		expect(document.body).toContainText("Ashley");
	});

	it("has a button element in each li", () => {
		render(<AppointmentsDayView appointments={twoAppointments}/>);

		const buttons = elements("li > button");
		expect(typesOf(elements("li > *"))).toEqual(["button", "button"])
	})

	it("renders another appointment when selected", () => {
		render(<AppointmentsDayView appointments={twoAppointments}/>)
		click(secondButton())
		expect(secondButton().className).toContain("toggled")
	})
});
