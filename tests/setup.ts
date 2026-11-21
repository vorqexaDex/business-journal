// Safety guard: never let tests run against a real database.
const url = process.env.DATABASE_URL ?? "";
const dbName = url.split("?")[0]?.split("/").pop() ?? "";

if (!dbName.endsWith("_test")) {
  throw new Error(
    `Refusing to run tests: DATABASE_URL points at "${dbName}", which is not a *_test database.`,
  );
}
