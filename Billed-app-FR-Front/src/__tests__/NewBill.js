/**
 * @jest-environment jsdom
 */
//
// Un mock c'est un faux objet qu'on crée pour remplacer une vraie dépendance pendant les tests.
// Il permet de simuler le comportement d'une partie du code qui n'est pas directement testée, comme une API ou une base de données,
// afin de se concentrer sur la logique spécifique que l'on souhaite tester.

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
  localStorageMock.setItem(
    "user",
    JSON.stringify({ email: "employee@test.com", type: "Employee" }),
  );
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill form should be displayed", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      // Vérifier que le formulaire est présent
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee and I am on NewBill Page", () => {
  describe("When I select a file with an invalid extension", () => {
    test("Then an alert should be displayed and the file input should be reset", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // test de la fonction handleChangeFile
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });
      // Simuler la sélection d'un fichier avec une extension non autorisée
      const fileInput = screen.getByTestId("file");
      const file = new File(["dummy content"], "test.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(fileInput, "files", {
        value: [file],
      });
      fireEvent.change(fileInput);
    });
  });
});

describe("Given I am connected as an employee and I am on NewBill Page", () => {
  describe("When I select a file with an valid extension", () => {
    test("Then the file should be accepted", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // test de la fonction handleChangeFile
      // mise en place d'un mock pour la fonction alert

      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });
      // Simuler la sélection d'un fichier avec une extension autorisée
      const fileInput = screen.getByTestId("file");
      const file = new File(["dummy content"], "test.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(fileInput, "files", {
        value: [file],
      });
      // Simuler l'événement de changement de fichier
      // fireEvent.change est une fonction de la bibliothèque @testing-library/dom qui permet de simuler un événement de changement sur un élément du DOM
      Object.defineProperty(fileInput, "value", {
        value: "C:\\fakepath\\test.jpg",
        writable: true,
      });

      fireEvent.change(fileInput);
      // Vérifier que les propriétés du fichier ont été mises à jour
      await waitFor(() => {
        expect(newBill.fileUrl).toBe("https://localhost:3456/images/test.jpg");
        expect(newBill.fileName).toBe("test.jpg");
        expect(newBill.billId).toBe("1234");
      });
    });
  });
});
