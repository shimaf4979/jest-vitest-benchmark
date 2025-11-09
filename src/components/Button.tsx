import React from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = "primary",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      data-testid="button"
    >
      {children}
    </button>
  );
};
