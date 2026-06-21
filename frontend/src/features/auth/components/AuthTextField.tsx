import { type ChangeEventHandler, type ReactNode, useId } from "react";

type AuthTextFieldProps = {
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  icon?: ReactNode;
};

export function AuthTextField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
}: AuthTextFieldProps) {
  const inputId = useId();

  return (
    <div className="block">
      <label
        htmlFor={inputId}
        className="mb-2 block text-xs font-medium text-slate-500"
      >
        {label}
      </label>
      <span className="flex h-12 items-center rounded-xl border border-slate-200 px-4 shadow-[0_2px_6px_rgba(15,23,42,0.03)] transition focus-within:border-[#2d64ef]">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {icon && <span className="text-slate-400">{icon}</span>}
      </span>
    </div>
  );
}
