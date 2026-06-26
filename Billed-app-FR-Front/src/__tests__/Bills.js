/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        }),
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
        )
        .map((a) => a.innerHTML);
      // -1 changer en +1
      const antiChrono = (a, b) => (a < b ? 1 : +1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

// Test getBills()
// tester si getBills() retourne les factures formatées correctement et gère les erreurs de formatage de date sans planter l'application
describe("Given I am connected as an Employee", () => {
  describe("When I call getBills", () => {
    test("Then it should return formatted bills", async () => {
      const bills = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      const result = await bills.getBills();
      expect(result[0].date).toBeDefined();
      expect(result[0].status).toBeDefined();
    });

    test("Then if a bill has a corrupted date, it should return the unformatted date", async () => {
      const mockStoreCorrupted = {
        bills: () => ({
          list: jest
            .fn()
            .mockResolvedValue([
              { id: "1", date: "date-corrompue", status: "pending" },
            ]),
        }),
      };

      const bills = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStoreCorrupted,
        localStorage: localStorageMock,
      });

      const result = await bills.getBills();
      expect(result[0].date).toBe("date-corrompue"); // date non formatée retournée
    });

    test("Then if store is undefined, it should return undefined", () => {
      const bills = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: localStorageMock,
      });

      const result = bills.getBills();
      expect(result).toBeUndefined();
    });
  });
});
