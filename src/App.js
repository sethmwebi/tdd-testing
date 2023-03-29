import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { CustomerForm } from "./CustomerForm";
import { AppointmentsDayViewLoader } from "./AppointmentsDayViewLoader";
import { AppointmentFormLoader } from "./AppointmentFormLoader";

const blankCustomer = {
	firstName: "",
	lastName: "",
	phoneNumber: "",
};

const blankAppointment = {
	service: "",
	stylist: "",
	startsAt: null,
};

export const App = () => {
	const [view, setView] = useState("dayView");
	const [customer, setCustomer] = useState();

	const transitionToAddCustomer = useCallback(
		() => setView("addCustomer"),
		[]
	);

	const transitionToAddAppointment = useCallback(
		(customer) => {
			setCustomer(customer);
			setView("addAppointment");
		},
		[]
	);

	const transitionToDayView = useCallback(() => setView("dayView"),[])

	switch (view) {
		case "addCustomer":
			return (
				<CustomerForm
					onSave={transitionToAddAppointment}
					original={blankCustomer}
				/>
			);
		case "addAppointment":
			return (
				<AppointmentFormLoader
					original={{
						...blankAppointment,
						customer: customer.id,
					}}
					onSave={transitionToDayView}
				/>
			);
		default:
			return (
				<>
					<menu>
						<li>
							<button
								type="button"
								onClick={transitionToAddCustomer}
							>
								Add customer and appointment
							</button>
						</li>
					</menu>
					<AppointmentsDayViewLoader />
				</>
			);
	}
};
