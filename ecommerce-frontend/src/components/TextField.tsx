// A "controlled" input: its value comes FROM React state (value prop) and
// every keystroke reports back OUT (onChange). React is the source of truth,
// not the DOM. This is the standard way to handle forms in React.
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
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        // e.target.value is what the user typed; we hand it up to the parent.
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </label>
  );
}
