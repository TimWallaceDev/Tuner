// components/CustomDropdown.jsx
import { useState, useRef, useEffect } from "react";
import "./CustomDropdown.scss";

export default function CustomDropdown({
  label,
  value,
  options,
  onChange,
  id,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const handleOptionClick = (val) => {
    onChange(val);
    setOpen(false);
  };

  const toggleOpen = () => setOpen((prev) => !prev);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
<div className="custom-dropdown" ref={dropdownRef}>
  <label htmlFor={id}>{label}</label>
  <div
    className="dropdown-box"
    onClick={toggleOpen}
    tabIndex={0}
  >
    <span className="selected">
      {options.find(o => o.value === value)?.label || "Select"}
    </span>
    <span className={`arrow ${open ? "open" : ""}`}>▼</span>
  </div>

  {open && (
    <ul className={`dropdown-options ${open ? "open" : ""}`}>
      {options.map(opt => (
        <li
          key={opt.value}
          className={`option ${value === opt.value ? "selected-option" : ""}`}
          onClick={() => handleOptionClick(opt.value)}
        >
          {opt.label}
        </li>
      ))}
    </ul>
  )}
</div>
  );
}
