import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/Button";
import { Counter } from "../components/Counter";
import { TodoList } from "../components/TodoList";
import { Form } from "../components/Form";

describe("React Components Tests - Vitest", () => {
  describe("Button Component", () => {
    test("should render button with text", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    test("should call onClick when clicked", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByText("Click me"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Click me</Button>);
      expect(screen.getByTestId("button")).toBeDisabled();
    });

    test("should render with different variants", () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByTestId("button")).toHaveClass("btn-primary");

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByTestId("button")).toHaveClass("btn-secondary");

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByTestId("button")).toHaveClass("btn-danger");
    });
  });

  describe("Counter Component", () => {
    test("should render with initial value", () => {
      render(<Counter initialValue={5} />);
      expect(screen.getByText("Counter: 5")).toBeInTheDocument();
    });

    test("should increment counter", () => {
      render(<Counter initialValue={0} step={1} />);
      const incrementBtn = screen.getByTestId("increment-btn");
      fireEvent.click(incrementBtn);
      expect(screen.getByText("Counter: 1")).toBeInTheDocument();
    });

    test("should decrement counter", () => {
      render(<Counter initialValue={5} step={1} />);
      const decrementBtn = screen.getByTestId("decrement-btn");
      fireEvent.click(decrementBtn);
      expect(screen.getByText("Counter: 4")).toBeInTheDocument();
    });

    test("should reset counter", () => {
      render(<Counter initialValue={10} />);
      const incrementBtn = screen.getByTestId("increment-btn");
      const resetBtn = screen.getByTestId("reset-btn");

      fireEvent.click(incrementBtn);
      fireEvent.click(incrementBtn);
      expect(screen.getByText("Counter: 12")).toBeInTheDocument();

      fireEvent.click(resetBtn);
      expect(screen.getByText("Counter: 10")).toBeInTheDocument();
    });

    test("should use custom step", () => {
      render(<Counter initialValue={0} step={5} />);
      const incrementBtn = screen.getByTestId("increment-btn");
      fireEvent.click(incrementBtn);
      expect(screen.getByText("Counter: 5")).toBeInTheDocument();
    });
  });

  describe("TodoList Component", () => {
    test("should render empty todo list", () => {
      render(<TodoList />);
      expect(screen.getByTestId("todo-list")).toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    test("should add todo item", async () => {
      render(<TodoList />);
      const input = screen.getByTestId("todo-input");
      const addBtn = screen.getByTestId("add-todo-btn");

      fireEvent.change(input, { target: { value: "Buy milk" } });
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(screen.getByText("Buy milk")).toBeInTheDocument();
      });
    });

    test("should add todo on Enter key", async () => {
      render(<TodoList />);
      const input = screen.getByTestId("todo-input");

      fireEvent.change(input, { target: { value: "Buy eggs" } });
      fireEvent.keyPress(input, { key: "Enter", code: 13, charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText("Buy eggs")).toBeInTheDocument();
      });
    });

    test("should not add empty todo", () => {
      render(<TodoList />);
      const input = screen.getByTestId("todo-input");
      const addBtn = screen.getByTestId("add-todo-btn");

      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(addBtn);

      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    test("should toggle todo completion", async () => {
      render(<TodoList />);
      const input = screen.getByTestId("todo-input");
      const addBtn = screen.getByTestId("add-todo-btn");

      fireEvent.change(input, { target: { value: "Test todo" } });
      fireEvent.click(addBtn);

      await waitFor(() => {
        const checkbox = screen.getByRole("checkbox");
        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
      });
    });

    test("should delete todo", async () => {
      render(<TodoList />);
      const input = screen.getByTestId("todo-input");
      const addBtn = screen.getByTestId("add-todo-btn");

      fireEvent.change(input, { target: { value: "To be deleted" } });
      fireEvent.click(addBtn);

      await waitFor(() => {
        const deleteBtn = screen.getByText("Delete");
        fireEvent.click(deleteBtn);
      });

      await waitFor(() => {
        expect(screen.queryByText("To be deleted")).not.toBeInTheDocument();
      });
    });

    test("should clear input after adding todo", async () => {
      render(<TodoList />);
      const input = screen.getByTestId("todo-input") as HTMLInputElement;
      const addBtn = screen.getByTestId("add-todo-btn");

      fireEvent.change(input, { target: { value: "New todo" } });
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });
  });

  describe("Form Component", () => {
    test("should render form fields", () => {
      render(<Form />);
      expect(screen.getByTestId("name-input")).toBeInTheDocument();
      expect(screen.getByTestId("email-input")).toBeInTheDocument();
      expect(screen.getByTestId("age-input")).toBeInTheDocument();
      expect(screen.getByTestId("submit-btn")).toBeInTheDocument();
    });

    test("should update form fields", () => {
      render(<Form />);
      const nameInput = screen.getByTestId("name-input") as HTMLInputElement;
      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
      const ageInput = screen.getByTestId("age-input") as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(ageInput, { target: { value: "30" } });

      expect(nameInput.value).toBe("John Doe");
      expect(emailInput.value).toBe("john@example.com");
      expect(ageInput.value).toBe("30");
    });

    test("should show validation errors for empty fields", async () => {
      render(<Form />);
      const submitBtn = screen.getByTestId("submit-btn");

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId("name-error")).toHaveTextContent(
          "Name is required",
        );
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Email is required",
        );
      });
    });

    test("should validate age range", async () => {
      render(<Form />);
      const ageInput = screen.getByTestId("age-input");
      const submitBtn = screen.getByTestId("submit-btn");

      fireEvent.change(ageInput, { target: { value: "200" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId("age-error")).toHaveTextContent(
          "Age must be between 0 and 150",
        );
      });
    });

    test("should call onSubmit with valid data", async () => {
      const handleSubmit = vi.fn();
      render(<Form onSubmit={handleSubmit} />);

      const nameInput = screen.getByTestId("name-input");
      const emailInput = screen.getByTestId("email-input");
      const ageInput = screen.getByTestId("age-input");
      const submitBtn = screen.getByTestId("submit-btn");

      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(ageInput, { target: { value: "30" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: "John Doe",
          email: "john@example.com",
          age: 30,
        });
      });
    });
  });
});
