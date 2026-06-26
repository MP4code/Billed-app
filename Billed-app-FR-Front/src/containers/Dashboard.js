//Ce fichier gère le tableau de bord administrateur (Dashboard)
//Le point clé de la correction est que index est le fil conducteur
//qui permet à chaque liste de fonctionner de manière totalement indépendante, même quand plusieurs sont ouvertes simultanément.
import { formatDate } from "../app/format.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import BigBilledIcon from "../assets/svg/big_billed.js";
import { ROUTES_PATH } from "../constants/routes.js";
import USERS_TEST from "../constants/usersTest.js";
import Logout from "./Logout.js";

export const filteredBills = (data, status) => {
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition;

        // in jest environment
        if (typeof jest !== "undefined") {
          selectCondition = bill.status === status;
        } else {
          /* istanbul ignore next */
          // in prod environment
          const userEmail = JSON.parse(localStorage.getItem("user")).email;
          selectCondition =
            bill.status === status &&
            ![...USERS_TEST, userEmail].includes(bill.email);
        }

        return selectCondition;
      })
    : [];
};

export const card = (bill) => {
  const firstAndLastNames = bill.email.split("@")[0];
  const firstName = firstAndLastNames.includes(".")
    ? firstAndLastNames.split(".")[0]
    : "";
  const lastName = firstAndLastNames.includes(".")
    ? firstAndLastNames.split(".")[1]
    : firstAndLastNames;

  return `
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `;
};

export const cards = (bills) => {
  return bills && bills.length ? bills.map((bill) => card(bill)).join("") : "";
};

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending";
    case 2:
      return "accepted";
    case 3:
      return "refused";
  }
};

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    //openStates "objet qui stocke l'état par index"
    this.openStates = {};
    $("#arrow-icon1").click((e) => this.handleShowTickets(e, bills, 1));
    $("#arrow-icon2").click((e) => this.handleShowTickets(e, bills, 2));
    $("#arrow-icon3").click((e) => this.handleShowTickets(e, bills, 3));
    new Logout({ localStorage, onNavigate });
  }

  handleClickIconEye = () => {
    const billUrl = $("#icon-eye-d").attr("data-bill-url");
    const imgWidth = Math.floor($("#modaleFileAdmin1").width() * 0.8);
    $("#modaleFileAdmin1")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`,
      );
    if (typeof $("#modaleFileAdmin1").modal === "function")
      $("#modaleFileAdmin1").modal("show");
  };

  // fonction (corrigée) qui gère l'affichage du ticket sélectionné
  // On récupére l'index 1, 2 ou 3 ("pending", "accepted" ou "refused")
  handleEditTicket(e, bill, bills, index) {
    const isActive = $(`#open-bill${bill.id}`).hasClass("active");

    // Reset UNIQUEMENT la liste actuelle
    $(`#status-bills-container${index} .bill-card`)
      .css({ background: "#0D5AE5" })
      .removeClass("active");

    if (!isActive) {
      $(`#open-bill${bill.id}`)
        .css({ background: "#2A2B35" })
        .addClass("active");

      $(".dashboard-right-container div").html(DashboardFormUI(bill));
      $(".vertical-navbar").css({ height: "150vh" });
    } else {
      $(".dashboard-right-container div").html(`
      <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
    `);
      $(".vertical-navbar").css({ height: "120vh" });
    }

    $("#icon-eye-d").click(this.handleClickIconEye);
    $("#btn-accept-bill").click((e) => this.handleAcceptSubmit(e, bill));
    $("#btn-refuse-bill").click((e) => this.handleRefuseSubmit(e, bill));
  }
  /*handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0;
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id;
    if (this.counter % 2 === 0) {
      bills.forEach((b) => {
        $(`#open-bill${b.id}`).css({ background: "#0D5AE5" });
      });
      $(`#open-bill${bill.id}`).css({ background: "#2A2B35" });
      $(".dashboard-right-container div").html(DashboardFormUI(bill));
      $(".vertical-navbar").css({ height: "150vh" });
      this.counter++;
    } else {
      $(`#open-bill${bill.id}`).css({ background: "#0D5AE5" });

      $(".dashboard-right-container div").html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `);
      $(".vertical-navbar").css({ height: "120vh" });
      this.counter++;
    }
    $("#icon-eye-d").click(this.handleClickIconEye);
    $("#btn-accept-bill").click((e) => this.handleAcceptSubmit(e, bill));
    $("#btn-refuse-bill").click((e) => this.handleRefuseSubmit(e, bill));
  }
*/
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "accepted",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "refused",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  // fonction (corrigée) qui gère l'affichage des tickets en fonction de leur statut
  handleShowTickets(e, bills, index) {
    if (!this.openStates[index]) {
      this.openStates[index] = false;
    }

    this.openStates[index] = !this.openStates[index];

    if (this.openStates[index]) {
      $(`#arrow-icon${index}`).css({ transform: "rotate(0deg)" });
      $(`#status-bills-container${index}`).html(
        cards(filteredBills(bills, getStatus(index))),
      );
    } else {
      $(`#arrow-icon${index}`).css({ transform: "rotate(90deg)" });
      $(`#status-bills-container${index}`).html("");
    }

    // CORRECTION : on n'attache les listeners qu'aux bills filtrés du conteneur
    // courant (index), et on passe l'index à handleEditTicket pour que le reset
    // visuel ne touche pas les autres listes ouvertes simultanément.
    filteredBills(bills, getStatus(index)).forEach((bill) => {
      $(`#open-bill${bill.id}`).click((e) =>
        this.handleEditTicket(e, bill, bills, index),
      );
    });

    return bills;
  }
  /*
  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0
    if (this.index === undefined || this.index !== index) this.index = index
    if (this.counter % 2 === 0) {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)'})
      $(`#status-bills-container${this.index}`)
        .html(cards(filteredBills(bills, getStatus(this.index))))
      this.counter ++
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)'})
      $(`#status-bills-container${this.index}`)
        .html("")
      this.counter ++
    }

    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills))
    })

    return bills

  }
    */

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => ({
            id: doc.id,
            ...doc,
            date: doc.date,
            status: doc.status,
          }));
          return bills;
        })
        .catch((error) => {
          throw error;
        });
    }
  };

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then((bill) => bill)
        .catch(console.log);
    }
  };
}
