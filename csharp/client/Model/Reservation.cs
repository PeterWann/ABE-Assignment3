using System;
using System.Collections.Generic;
using System.Text;

namespace Client.Model
{
    class Reservation
    {
        public int hotelId { get; set; }

        public string checkIn { get; set; }

        public string checkOut { get; set; }

        public int roomNo { get; set; }

        public string customerName { get; set; }

        public string customerEmail { get; set; }

        public string customerAddress { get; set; }

        public int orderNo { get; set; }
    }
}
