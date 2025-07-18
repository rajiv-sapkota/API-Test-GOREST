// generate-fake-user.ts
import { faker } from "@faker-js/faker";

export function generateFakeuser() {
  return {
    username: faker.internet.username(),
    password: faker.internet.password({ length: 12 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    zipCode: faker.location.zipCode(),
    email: faker.internet.email(),
    gender: faker.helpers.arrayElement(["male", "female"]),
    title:faker.string.alpha({length:256})
  };
}
