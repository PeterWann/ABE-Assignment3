// Code inspired from: https://rabbitmq.com/tutorials/tutorial-six-javascript.html

import { Reservation } from "./model/reservation";

const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0: any, connection: any) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1: any, channel: any) {
        if (error1) {
            throw error1;
        }
        
        const queue = 'node_client_queue';

        channel.assertQueue(queue, {
            exclusive: true,
        }, function (error2: any, q: any) {
            if (error2) {
                throw error2;
            }
            const correlationId = generateUuid();

            const reservation = JSON.stringify(createReservation());

            console.log(' [x] Requesting reservation from NodeClient: %s', reservation);

            channel.consume(q.queue, function(msg: any) {
                if (msg.properties.correlationId == correlationId) {
                    const reservation: Reservation = JSON.parse(msg.content);
                    console.log(' [x] Reservation received: %s ', msg.content.toString());
                    console.log(' [x] Order no.: %s', reservation.orderNo);
                    setTimeout(function() {
                        connection.close();
                        process.exit(0);
                    }, 500);
                }
            },
            {
                noAck: true
            });

            channel.sendToQueue('reservation_queue',
            Buffer.from(reservation), {
                correlationId: correlationId,
                replyTo: q.queue,
            });
        })
    })
})

function generateUuid(): String {
    
    return Math.random().toString() +
           Math.random().toString() +
           Math.random().toString();
}

function createReservation(): Reservation {

    const reservation: Reservation = {
      hotelId: Math.floor(Math.random() * 100), // Random number between 0 - 99
      checkIn: "2022-05-01",
      checkOut: "2022-05-02",
      roomNo: Math.floor(Math.random() * 100), // Random number between 0 - 99
      customerName: "Group25",
      customerEmail: "Node@Client.dk",
      customerAddress: "Node Client Reservation",
    }

    return reservation;
}