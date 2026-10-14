"use client";

type AuthFieldProps = {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">;

/**
 * Labeled field for the auth pages (sign-up, login,
 * forgot password, reset). A single place for the styling:
 * `text-secondary` label at 12 px (contrast ≥ 4.5:1) and
 * `border-input` border (≥ 3:1), readable on the dark panel.
 */
export default function AuthField({ label, id, value, onChange, ...rest }: AuthFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block font-tech text-xs uppercase tracking-[0.15em] text-nebula-text-secondary">
        {label}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-nebula-border-input bg-nebula-bg-darkest/60 px-3 py-2.5 font-tech text-sm text-nebula-text outline-none transition-colors focus:border-nebula-cyan"
        {...rest}
      />
    </label>
  );
}
