"use client";

type AuthFieldProps = {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">;

/**
 * Champ libellé des pages d'authentification (inscription, connexion,
 * mot de passe oublié, réinitialisation). Un seul endroit pour le style :
 * libellé `text-secondary` en 12 px (contraste ≥ 4,5:1) et bordure
 * `border-input` (≥ 3:1), lisibles sur le panneau sombre.
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
