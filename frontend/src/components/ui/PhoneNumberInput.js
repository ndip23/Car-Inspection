// frontend/src/components/ui/PhoneNumberInput.js
import React from 'react';
import { countryCodes } from '../../data/countryCodes';

const PhoneNumberInput = ({
  label,
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  namePrefix,
  required = true // Make required by default
}) => {
  // --- UPDATED STYLING CLASSES ---
  // The input now has `flex-grow` to take up the remaining space
  const inputClass = "p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-l-0 border-light-border dark:border-dark-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary w-full flex-grow";
  const selectClass = "p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-r-0 border-light-border dark:border-dark-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0";

  return (
    <div>
      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
        {label}
      </label>
      <div className="flex items-center"> {/* The flex container handles the layout */}
        <select
          name={`${namePrefix}_code`}
          value={countryCode}
          onChange={onCountryCodeChange}
          className={selectClass}
        >
          {countryCodes.map(country => (
            <option key={country.code} value={country.dial_code}>
              {country.code} ({country.dial_code})
            </option>
          ))}
        </select>
        <input
          type="tel"
          name={`${namePrefix}_number`}
          placeholder="Enter number"
          value={phoneNumber}
          onChange={onPhoneNumberChange}
          required={required} // Use the prop
          className={inputClass}
        />
      </div>
    </div>
  );
};

export default PhoneNumberInput;