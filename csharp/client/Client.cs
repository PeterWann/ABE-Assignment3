using System;
using System.Collections.Concurrent;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Newtonsoft.Json;

namespace Client
{
    public class Client
    {
        private readonly IConnection connection;
        private readonly IModel channel;
        private readonly string replyQueueName;
        private readonly EventingBasicConsumer consumer;
        private readonly BlockingCollection<string> respQueue = new BlockingCollection<string>();
        private readonly IBasicProperties props;

        public Client()
        {
            var factory = new ConnectionFactory() { HostName = "localhost" };

            connection = factory.CreateConnection();
            channel = connection.CreateModel();
            replyQueueName = channel.QueueDeclare("csharp_client_queue");
            consumer = new EventingBasicConsumer(channel);

            props = channel.CreateBasicProperties();
            var correlationId = Guid.NewGuid().ToString();
            props.CorrelationId = correlationId;
            props.ReplyTo = replyQueueName;

            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var response = Encoding.UTF8.GetString(body);
                if (ea.BasicProperties.CorrelationId == correlationId)
                {
                    respQueue.Add(response);
                }
            };

            channel.BasicConsume(
                consumer: consumer,
                queue: replyQueueName,
                autoAck: true);
        }

        public string newReservation()
        {
            var reservation = new Model.Reservation
            {
                hotelId = new Random().Next(0, 99),
                checkIn = "2022-05-01",
                checkOut = "2022-05-02",
                roomNo = new Random().Next(0, 99),
                customerName = "Group25",
                customerEmail = "CSharp@Client.dk",
                customerAddress = "C# Client Reservation",
            };

            var message = JsonConvert.SerializeObject(reservation);

            var messageBytes = Encoding.UTF8.GetBytes(message);
            channel.BasicPublish(
            exchange: "",
            routingKey: "reservation_queue",
            basicProperties: props,
            body: messageBytes);

            return respQueue.Take();
        }

        public void Close()
        {
            connection.Close();
        }
    }

    public class CSharpClient
    {
        public static void Main()
        {
            var client = new Client();

            Console.WriteLine(" [x] Requesting reservation from CSharpClient ");

            var response = client.newReservation();

            var result = JsonConvert.DeserializeObject<Model.Reservation>(response);

            Console.WriteLine(" [x] Reservation received: {0}", response);

            Console.WriteLine(" [x] Order no.: {0}", result.orderNo);

            client.Close();
        }
    }
}
