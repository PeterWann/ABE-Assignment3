// Code inspired from: https://rabbitmq.com/tutorials/tutorial-six-javascript.html

import { reservationSchema } from "./model/reservation";
import { Reservation } from "./model/reservation";
import mongoose from "mongoose";

const reservationConnection = mongoose.createConnection(
    "mongodb://localhost:27017/hotels"
  );

  const reservationModel = reservationConnection.model("Reservation", reservationSchema);

  const amqp = require('amqplib/callback_api');
  
  amqp.connect('amqp://localhost', function(error0: any, connection: any) {
      if (error0) {
          throw error0
      }
      connection.createChannel(function(error1: any, channel: any){
        if (error1) {
            throw error1;
        }
        const queue = 'reservation_queue';

        channel.assertQueue(queue, {
            durable: true
        });
        channel.prefetch(1);
        
        console.log(' [x] Awaiting RPC requests in %s. ', queue);

        channel.consume(queue, async function reply(msg: any) {
            console.log(' [x] Received message from: %s', msg.properties.replyTo);
            console.log(' [x] Message: %s', msg.content.toString());
            const reservation: Reservation = JSON.parse(msg.content);
            const { reservationId } = await new reservationModel(reservation).save();
            reservation.orderNo = Math.floor(Math.random() * 100);
            channel.sendToQueue(msg.properties.replyTo,
                Buffer.from(JSON.stringify(reservation)), {
                  correlationId: msg.properties.correlationId,
                });
            channel.ack(msg);
        });
      });
  })



