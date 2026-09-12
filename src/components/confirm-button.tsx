"use client";

/** Submit button that asks first — thumbs slip on phones. */
export function ConfirmButton({
  message,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { message: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
}
