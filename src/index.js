import React from "react";
import ReactDOM from "react-dom/client";
import { AppointmentForm } from "./AppointmentForm.js";
import { AppointmentsDayView } from "./AppointmentsDayView.js";
import { CustomerForm } from "./CustomerForm.js";
import { sampleAppointments, sampleAvailableTimeSlots } from "./sampleData.js";

ReactDOM.createRoot(document.getElementById("root")).render(
	<AppointmentForm original={{}} availableTimeSlots={sampleAvailableTimeSlots} appointments={sampleAppointments} onSubmit={() => {}}/>
);
