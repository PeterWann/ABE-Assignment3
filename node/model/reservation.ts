import { Schema } from 'mongoose'

export interface Reservation {
    hotelId: Number,
    checkIn: String,
    checkOut: String,
    roomNo: Number,
    customerName: String,
    customerEmail: String,
    customerAddress: String,
    orderNo?: Number,
}

export const reservationSchema: Schema = new Schema<Reservation>({
  hotelId: { type: Number, required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  roomNo: { type: Number, required: true },
  customerName: { type: String, required: true }, 
  customerEmail: { type: String, required: true },
  customerAddress: { type: String, required: true },
  orderNo: { type: Number, required: false },
})