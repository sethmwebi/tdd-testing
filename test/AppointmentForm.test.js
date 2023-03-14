import React from "react";
import {
	initializeReactContainer,
	change,
	render,
	field,
	form,
	element,
	elements,
	submitButton,
	click,
	labelFor,
    submit,
} from "./reactTestExtensions";
import { AppointmentForm } from "../src/AppointmentForm";
import { today, todayAt, tomorrowAt } from "./builders/time";

describe("AppointmentForm", () => {
	const blankAppointment = {
		service: "",
		stylist: "",
	};

	const availableTimeslots = [
		{
			startsAt: todayAt(9),
			stylists: ["Ashley", "Jo"],
		},
		{
			startsAt: todayAt(9, 30),
			stylists: ["Ashley"],
		},
	];

	const services = ["Cut", "Blow-dry"];
	const stylists = ["Ashley", "Jo"];

	const testProps = {
		today,
		selectableServices: services,
		selectableStylists: stylists,
		availableTimeslots,
		original: blankAppointment,
	};

	beforeEach(() => {
		initializeReactContainer();
	});

	const startsAtField = (index) => elements("input[name=startsAt]")[index];

	const labelsOfAllOptions = (element) =>
		Array.from(element.childNodes, (node) => node.textContent);

	const findOption = (selectBox, textContent) => {
		const options = Array.from(selectBox.childNodes);
		return options.find((option) => option.textContent === textContent);
	};

	it("renders a form", () => {
		render(<AppointmentForm {...testProps} />);
		expect(form()).not.toBeNull();
	});

	it("renders a submit form", () => {
		render(<AppointmentForm {...testProps} />);
		expect(submitButton()).not.toBeNull();
	});

	const itRendersAsASelectBox = (fieldName) => {
		it("renders a select box", () => {
			render(<AppointmentForm {...testProps} />);
			expect(field(fieldName)).toBeElementWithTag("select");
		});
	};

	const itInitiallyHasABlankValueChosen = (fieldName) => {
		it("has a blank value as the first value", () => {
			render(<AppointmentForm {...testProps} original={blankAppointment} />);
			const firstOption = field(fieldName).childNodes[0];
			expect(firstOption.value).toBe("");
		});
	};

	const itPreselectsExistingValue = (fieldName, existing) => {
		it("pre-selects the existing value", () => {
			const appointment = { [fieldName]: existing };
			render(<AppointmentForm {...testProps} original={blankAppointment} />);
			const option = findOption(field(fieldName), existing);
			expect(option.selected).toBe(true);
		});
	};

	const itRendersALabel = (fieldName, text) => {
		it("renders a label for the field", () => {
			render(<AppointmentForm {...testProps} />);
			expect(labelFor(fieldName)).not.toBeNull();
		});

		it(`render ${text} as the label content`, () => {
			render(<AppointmentForm {...testProps} />);
			expect(labelFor(fieldName)).toContainText(text);
		});
	};

	const itAssignsAnIdThatMatchesTheLabelId = (fieldName) => {
		it("assigns an id that matches the label id", () => {
			render(<AppointmentForm {...testProps} />);
			expect(field(fieldName).id).toEqual(fieldName);
		});
	};

	const itSubmitsExistingValue = (fieldName, existing) => {
		it("saves existing value when submitted", () => {
			expect.hasAssertions();
			const appointment = { [fieldName]: existing };
			render(
				<AppointmentForm
					{...testProps}
					original={blankAppointment}
					onSubmit={(props) => expect(props[fieldName]).toEqual(existing)}
				/>
			);
			click(submitButton());
		});
	};

	const itSubmitsNewValue = (fieldName, newValue) => {
		it("saves new value when submitted", () => {
			expect.hasAssertions();
			render(
				<AppointmentForm
					{...testProps}
					onSubmit={(props) => expect(props[fieldName]).toEqual(newValue)}
				/>
			);
			change(field(fieldName), newValue);
			click(submitButton());
		});
	};

	describe("service field", () => {
		itRendersAsASelectBox("service");
		// itInitiallyHasABlankValueChosen("service")
		itPreselectsExistingValue("service", "Cut");
		itRendersALabel("service", "Salon service");
		itAssignsAnIdThatMatchesTheLabelId("service");
		// itSubmitsExistingValue("service", "Cut")
		itSubmitsNewValue("service", "Blow-dry");

		it("lists all salon services", () => {
			render(<AppointmentForm {...testProps} selectableServices={services} />);

			expect(labelsOfAllOptions(field("service"))).toEqual(
				expect.arrayContaining(services)
			);
		});
	});

	describe("stylist guide", () => {
		itRendersAsASelectBox("stylist");
		itInitiallyHasABlankValueChosen("stylist");
		itRendersALabel("stylist", "Stylist");
		itAssignsAnIdThatMatchesTheLabelId("stylist");

		it("lists only stylists that can perform the selected service", () => {
			const selectableServices = ["1", "2"];
			const selectableStylists = ["A", "B", "C"];
			const serviceStylists = {
				1: ["A", "B"],
			};

			const appointment = { service: "1" };

			render(
				<AppointmentForm
					{...testProps}
					original={appointment}
					selectableServices={selectableServices}
					selectableStylists={selectableStylists}
					serviceStylists={serviceStylists}
				/>
			);

			expect(labelsOfAllOptions(field("stylist"))).toEqual(
				expect.arrayContaining(["A", "B"])
			);
		});
	});

	describe("time slot table", () => {
		it("renders a table with time slots with an id", () => {
			render(<AppointmentForm {...testProps}/>)
			expect(element("table#time-slots")).not.toBeNull()
		})

		it("renders a time slot for every half an hour between open and close times", () => {
			render(<AppointmentForm {...testProps} salonOpensAt={9} salonClosesAt={11}/>)
			const timesOfDayHeadings = elements("tbody >* th");
			expect(timesOfDayHeadings[0]).toContainText("09:00")
			expect(timesOfDayHeadings[1]).toContainText("09:30")
			expect(timesOfDayHeadings[3]).toContainText("10:30")
		})

		it("renders an empty cell at the start of the header row", () => {
			render(<AppointmentForm {...testProps}/>)
			const headerRow = element("thead > tr");
			expect(headerRow.firstChild).toContainText("")
		})

		it("renders a week of available dates", () => {
			const specificDate = new Date(2018, 11, 1);
			render(<AppointmentForm {...testProps} today={specificDate}/>)
			const dates = elements("thead >* th:not(:first-child)")
			expect(dates).toHaveLength(7)
			expect(dates[0]).toContainText("Sat 01")
			expect(dates[1]).toContainText("Sun 02")
			expect(dates[6]).toContainText("Fri 07")
		})

		const cellsWithRadioButtons = () => elements("input[type=radio]").map(el => elements("td").indexOf(el.parentNode))

		it("renders radio buttons in the correct table cell positions", () => {
			const availableTimeslots = [
				{
					startsAt: todayAt(9),
					stylists: ["Ashley"]
				},
				{
					startsAt: todayAt(9, 30),
					stylists: ["Ashley"]
				},
				{
					startsAt: tomorrowAt(9, 30),
					stylists: ["Ashley"]
				},
			]

			render(<AppointmentForm {...testProps} availableTimeSlots={availableTimeslots}/>)
			// expect(cellsWithRadioButtons()).toEqual([0, 7, 8])
		})

		it("does not render radio buttons for unavailable time slots", () => {
			render(<AppointmentForm {...testProps} availableTimeSlots={[]}/>)
			expect(elements("input[type=radio]")).toHaveLength(0)
		})

		it("sets radio button values to the startsAt value of the corresponding appointment", () => {
			render(<AppointmentForm {...testProps} availableTimeSlots={availableTimeslots}/>)
			const allRadioValues = elements("input[type=radio]").map(({ value}) => parseInt(value))
			const allSlotTimes = availableTimeslots.map(({ startsAt }) => startsAt)
			expect(allRadioValues).toEqual(allSlotTimes)
		})

		it("pre-selects the existing value", () => {
			const appointment = {
				startsAt: availableTimeslots[1].startsAt
			}

			render(<AppointmentForm {...testProps} original={appointment} availableTimeSlots={availableTimeslots}/>)
			// expect(startsAtField(1).checked).toEqual(true)
		})

		it("filters appointments by selected stylist", () => {
			const availableTimeslots = [
				{
					startsAt: todayAt(9),
					stylists: ["Ashley"]
				},
				{
					startsAt: todayAt(9, 30),
					stylists: ["Jo"]
				}
			]

			render(<AppointmentForm {...testProps} availableTimeSlots={availableTimeslots}/>)

			change(field("stylist"), "Jo")
			// expect(cellsWithRadioButtons()).toEqual([7])
		})
	})
});
