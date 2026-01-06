type ButtonProps = {
  label: string //button label
  onClick?: () => void //optional button on click function
  type?: "button" | "submit" | "reset"
}

export default function Button({ label, onClick, type}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      type={type}
    >
      {label}
    </button>
  )
}
