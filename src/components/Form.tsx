import React, { useState } from "react";

interface FormData {
  name: string;
  email: string;
  age: number;
}

interface FormErrors {
  name?: string;
  email?: string;
  age?: string;
}

interface FormProps {
  onSubmit?: (data: FormData) => void;
}

export const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    age: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.age < 0 || formData.age > 150) {
      newErrors.age = "Age must be between 0 and 150";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          data-testid="name-input"
        />
        {errors.name && (
          <span data-testid="name-error" style={{ color: "red" }}>
            {errors.name}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          data-testid="email-input"
        />
        {errors.email && (
          <span data-testid="email-error" style={{ color: "red" }}>
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="age">Age:</label>
        <input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) =>
            setFormData({ ...formData, age: Number(e.target.value) })
          }
          data-testid="age-input"
        />
        {errors.age && (
          <span data-testid="age-error" style={{ color: "red" }}>
            {errors.age}
          </span>
        )}
      </div>

      <button type="submit" data-testid="submit-btn">
        Submit
      </button>
    </form>
  );
};
