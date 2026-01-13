import { ButtonHTMLAttributes } from "react";


type ButtonProps = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ label, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${props.className ?? ""}`}
    >
      {label}
    </button>
  );
}
