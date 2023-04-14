import React, { useState } from "react";
import {
  required,
  match,
  list,
  hasError,
  validateMany,
  anyErrors,
} from "./formValidation.js";

const Error = ({ hasError }) => (
  <p role="alert">
    {hasError ? "error occurred during save." : ""}
  </p>
);

export const CustomerForm = ({
  original,
  onSave,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState(original);
  const [error, setError] = useState(false);
  const [validationErrors, setValidationErrors] =
    useState({});

  const handleChange = ({ target }) => {
    setCustomer((customer) => ({
      ...customer,
      [target.name]: target.value,
    }));
    if (hasError(validationErrors, target.name)) {
      validateSingleField(target.name, target.value);
    }
  };
  const validators = {
    firstName: required("First name is required"),
    lastName: required("Last name is required"),
    phoneNumber: list(
      required("Phone number is required"),
      match(
        /^[0-9+()\- ]*$/,
        "Only numbers, spaces and these symbols are allowed: () + -"
      )
    ),
  };

  const validateSingleField = (
    fieldName,
    fieldValue
  ) => {
    const result = validateMany(validators, {
      [fieldName]: fieldValue,
    });
    setValidationErrors({
      ...validationErrors,
      ...result,
    });
  };

  const handleBlur = ({ target }) =>
    validateSingleField(target.name, target.value);

  const doSave = async () => {
    setSubmitting(true);
    const result = await global.fetch("/customers", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    setSubmitting(false);
    if (result.ok) {
      setError(false);
      const customerWithId = await result.json();
      onSave(customerWithId);
    } else if (result.status === 422) {
      const response = await result.json();
      setValidationErrors(response.errors);
    } else {
      setError(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationResult = validateMany(
      validators,
      customer
    );
    if (!anyErrors(validationResult)) {
      await doSave();
    } else {
      setValidationErrors(validationResult);
    }
  };

  const renderError = (fieldName) => {
    return (
      <span id={`${fieldName}Error`} role="alert">
        {hasError(validationErrors, fieldName)
          ? validationErrors[fieldName]
          : ""}
      </span>
    );
  };

  return (
    <form id="customer" onSubmit={handleSubmit}>
      <Error hasError={error} />
      <label htmlFor="firstName">First Name</label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        value={customer.firstName}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-describedby="firstNameError"
      />
      {renderError("firstName")}
      <label htmlFor="lastName">Last Name</label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        value={customer.lastName}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-describedby="lastNameError"
      />
      {renderError("lastName")}
      <label htmlFor="phoneNumber">
        Phone Number
      </label>
      <input
        type="text"
        name="phoneNumber"
        id="phoneNumber"
        value={customer.phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-describedby="phoneNumberError"
      />
      {renderError("phoneNumber")}
      <input type="submit" value="Add" />
      {submitting ? (
        <span className="submittingIndicator"></span>
      ) : null}
    </form>
  );
};
