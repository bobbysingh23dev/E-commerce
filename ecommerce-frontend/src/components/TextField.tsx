// A "controlled" input: its value comes FROM React state (value prop) and
// every keystroke reports back OUT (onChange). React is the source of truth.
interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  placeholder?: string;
}

export default function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  minLength,
  placeholder,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder={placeholder}
        className="input"
      />
    </label>
  );
}
