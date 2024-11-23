/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  #customerId;
  #numGuests;
  #startAt;

  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** Getter and Setter for numGuests */
  get numGuests() {
    return this.#numGuests;
  }

  set numGuests(value){
    if (value < 1) {
      throw new Error("Number of guests must be at least 1.")
    }
    this.#numGuests = value
  }

  /** Getter and setter for startAt */
  get startAt() {
    return this.#startAt
  }

  set startAt(value){
    if (!value instanceof Date){
      throw newError("Start date must be a valid Date object.")
    }
    this.#startAt = value
  }

  /** Getter and Setter for customerId */
  get customerId() {
    return this.#customerId
  }

  set customerId(value){
    if (this.#customerId !== undefined && this.#customerId !== value){
      throw new Error ("Customer ID cannot be reassigned once set.")
    }
    this.#customerId = value
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id,
           customer_id AS "customerId",
           num_guests AS "numGuests",
           start_at AS "startAt",
           notes AS "notes"
         FROM reservations
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (!this.id) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
         [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id
    } else {
      await db.query(
        `UPDATE reservations
        SET customer_id = $1, num_guests = $2, start_at = $3, notes = $4
        WHERE id = $5`,
        [this.customerId, this.numGuests, this.startAt, this.notes, this.id]
      )
    }
  }
}


module.exports = Reservation;
