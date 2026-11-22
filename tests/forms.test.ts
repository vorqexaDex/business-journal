import { describe, expect, it } from "vitest";
import { formValues } from "@/core/forms";

describe("formValues", () => {
  it("returns what the user typed", () => {
    const data = new FormData();
    data.set("email", "ada@example.com");
    data.set("name", "Ada");

    expect(formValues(data)).toEqual({ email: "ada@example.com", name: "Ada" });
  });

  it("never sends omitted fields such as passwords back", () => {
    const data = new FormData();
    data.set("email", "ada@example.com");
    data.set("password", "super-secret");

    const values = formValues(data, ["password"]);

    expect(values).toEqual({ email: "ada@example.com" });
    expect(values).not.toHaveProperty("password");
  });

  it("drops React's internal form fields", () => {
    const data = new FormData();
    data.set("$ACTION_ID_abc123", "");
    data.set("email", "ada@example.com");

    expect(formValues(data)).toEqual({ email: "ada@example.com" });
  });
});
