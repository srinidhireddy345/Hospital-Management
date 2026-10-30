/**
 * ONE Centralized Doctor Database for MediConnect.
 * Used across:
 * 1. Find a Doctor
 * 2. Book an Appointment
 * 3. Meet Our Specialists
 * 4. Doctor Dashboard
 *
 * Total Doctors: 60 unique doctors across 10 departments and 8 locations.
 */

export const LOCATIONS = [
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad"
];

export const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "General Medicine",
  "Gynecology",
  "ENT",
  "Ophthalmology",
  "Psychiatry"
];

export const DOCTORS = [
  {
    "doctorId": "doc-01",
    "id": "doc-01",
    "name": "Dr. Arjun Mehta",
    "department": "Cardiology",
    "specialty": "Cardiology",
    "specialization": "Cardiology",
    "location": "Hyderabad",
    "locations": [
      "Hyderabad"
    ],
    "busyDays": [
      2,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Arjun Mehta is a certified specialist in Cardiology at MediConnect Hyderabad with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-02",
    "id": "doc-02",
    "name": "Dr. Anjali Rao",
    "department": "Neurology",
    "specialty": "Neurology",
    "specialization": "Neurology",
    "location": "Mumbai",
    "locations": [
      "Mumbai"
    ],
    "busyDays": [
      1,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Anjali Rao is a certified specialist in Neurology at MediConnect Mumbai with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-03",
    "id": "doc-03",
    "name": "Dr. Rahul Verma",
    "department": "Orthopedics",
    "specialty": "Orthopedics",
    "specialization": "Orthopedics",
    "location": "Delhi",
    "locations": [
      "Delhi"
    ],
    "busyDays": [
      3,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Rahul Verma is a certified specialist in Orthopedics at MediConnect Delhi with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-04",
    "id": "doc-04",
    "name": "Dr. Priya Sharma",
    "department": "Pediatrics",
    "specialty": "Pediatrics",
    "specialization": "Pediatrics",
    "location": "Bengaluru",
    "locations": [
      "Bengaluru"
    ],
    "busyDays": [
      1,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Priya Sharma is a certified specialist in Pediatrics at MediConnect Bengaluru with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-05",
    "id": "doc-05",
    "name": "Dr. Vikram Singh",
    "department": "Dermatology",
    "specialty": "Dermatology",
    "specialization": "Dermatology",
    "location": "Chennai",
    "locations": [
      "Chennai"
    ],
    "busyDays": [
      2,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Vikram Singh is a certified specialist in Dermatology at MediConnect Chennai with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-06",
    "id": "doc-06",
    "name": "Dr. Neha Reddy",
    "department": "General Medicine",
    "specialty": "General Medicine",
    "specialization": "General Medicine",
    "location": "Pune",
    "locations": [
      "Pune"
    ],
    "busyDays": [
      3,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Neha Reddy is a certified specialist in General Medicine at MediConnect Pune with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-07",
    "id": "doc-07",
    "name": "Dr. Rohan Patel",
    "department": "Gynecology",
    "specialty": "Gynecology",
    "specialization": "Gynecology",
    "location": "Kolkata",
    "locations": [
      "Kolkata"
    ],
    "busyDays": [
      4,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Rohan Patel is a certified specialist in Gynecology at MediConnect Kolkata with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-08",
    "id": "doc-08",
    "name": "Dr. Sneha Kapoor",
    "department": "ENT",
    "specialty": "ENT",
    "specialization": "ENT",
    "location": "Ahmedabad",
    "locations": [
      "Ahmedabad"
    ],
    "busyDays": [
      1,
      3
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Sneha Kapoor is a certified specialist in ENT at MediConnect Ahmedabad with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-09",
    "id": "doc-09",
    "name": "Dr. Karan Malhotra",
    "department": "Ophthalmology",
    "specialty": "Ophthalmology",
    "specialization": "Ophthalmology",
    "location": "Hyderabad",
    "locations": [
      "Hyderabad"
    ],
    "busyDays": [
      2,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Karan Malhotra is a certified specialist in Ophthalmology at MediConnect Hyderabad with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-10",
    "id": "doc-10",
    "name": "Dr. Meera Nair",
    "department": "Psychiatry",
    "specialty": "Psychiatry",
    "specialization": "Psychiatry",
    "location": "Mumbai",
    "locations": [
      "Mumbai"
    ],
    "busyDays": [
      1,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Meera Nair is a certified specialist in Psychiatry at MediConnect Mumbai with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-11",
    "id": "doc-11",
    "name": "Dr. Aditya Shah",
    "department": "Cardiology",
    "specialty": "Cardiology",
    "specialization": "Cardiology",
    "location": "Bengaluru",
    "locations": [
      "Bengaluru"
    ],
    "busyDays": [
      3,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Aditya Shah is a certified specialist in Cardiology at MediConnect Bengaluru with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-12",
    "id": "doc-12",
    "name": "Dr. Kavya Iyer",
    "department": "Neurology",
    "specialty": "Neurology",
    "specialization": "Neurology",
    "location": "Chennai",
    "locations": [
      "Chennai"
    ],
    "busyDays": [
      1,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Kavya Iyer is a certified specialist in Neurology at MediConnect Chennai with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-13",
    "id": "doc-13",
    "name": "Dr. Amit Kumar",
    "department": "Orthopedics",
    "specialty": "Orthopedics",
    "specialization": "Orthopedics",
    "location": "Pune",
    "locations": [
      "Pune"
    ],
    "busyDays": [
      2,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Amit Kumar is a certified specialist in Orthopedics at MediConnect Pune with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-14",
    "id": "doc-14",
    "name": "Dr. Pooja Desai",
    "department": "Pediatrics",
    "specialty": "Pediatrics",
    "specialization": "Pediatrics",
    "location": "Kolkata",
    "locations": [
      "Kolkata"
    ],
    "busyDays": [
      3,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Pooja Desai is a certified specialist in Pediatrics at MediConnect Kolkata with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-15",
    "id": "doc-15",
    "name": "Dr. Nisha Rao",
    "department": "Dermatology",
    "specialty": "Dermatology",
    "specialization": "Dermatology",
    "location": "Ahmedabad",
    "locations": [
      "Ahmedabad"
    ],
    "busyDays": [
      4,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Nisha Rao is a certified specialist in Dermatology at MediConnect Ahmedabad with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-16",
    "id": "doc-16",
    "name": "Dr. Suresh Menon",
    "department": "General Medicine",
    "specialty": "General Medicine",
    "specialization": "General Medicine",
    "location": "Hyderabad",
    "locations": [
      "Hyderabad"
    ],
    "busyDays": [
      1,
      3
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Suresh Menon is a certified specialist in General Medicine at MediConnect Hyderabad with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-17",
    "id": "doc-17",
    "name": "Dr. Shalini Gupta",
    "department": "Gynecology",
    "specialty": "Gynecology",
    "specialization": "Gynecology",
    "location": "Mumbai",
    "locations": [
      "Mumbai"
    ],
    "busyDays": [
      2,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Shalini Gupta is a certified specialist in Gynecology at MediConnect Mumbai with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-18",
    "id": "doc-18",
    "name": "Dr. Varun Joshi",
    "department": "ENT",
    "specialty": "ENT",
    "specialization": "ENT",
    "location": "Delhi",
    "locations": [
      "Delhi"
    ],
    "busyDays": [
      1,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Varun Joshi is a certified specialist in ENT at MediConnect Delhi with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-19",
    "id": "doc-19",
    "name": "Dr. Aditi Kulkarni",
    "department": "Ophthalmology",
    "specialty": "Ophthalmology",
    "specialization": "Ophthalmology",
    "location": "Bengaluru",
    "locations": [
      "Bengaluru"
    ],
    "busyDays": [
      3,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Aditi Kulkarni is a certified specialist in Ophthalmology at MediConnect Bengaluru with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-20",
    "id": "doc-20",
    "name": "Dr. Manish Agarwal",
    "department": "Psychiatry",
    "specialty": "Psychiatry",
    "specialization": "Psychiatry",
    "location": "Chennai",
    "locations": [
      "Chennai"
    ],
    "busyDays": [
      1,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Manish Agarwal is a certified specialist in Psychiatry at MediConnect Chennai with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-21",
    "id": "doc-21",
    "name": "Dr. Riya Sharma",
    "department": "Cardiology",
    "specialty": "Cardiology",
    "specialization": "Cardiology",
    "location": "Kolkata",
    "locations": [
      "Kolkata"
    ],
    "busyDays": [
      2,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Riya Sharma is a certified specialist in Cardiology at MediConnect Kolkata with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-22",
    "id": "doc-22",
    "name": "Dr. Ananya Rao",
    "department": "Neurology",
    "specialty": "Neurology",
    "specialization": "Neurology",
    "location": "Ahmedabad",
    "locations": [
      "Ahmedabad"
    ],
    "busyDays": [
      3,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Ananya Rao is a certified specialist in Neurology at MediConnect Ahmedabad with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-23",
    "id": "doc-23",
    "name": "Dr. Kunal Mehta",
    "department": "Orthopedics",
    "specialty": "Orthopedics",
    "specialization": "Orthopedics",
    "location": "Hyderabad",
    "locations": [
      "Hyderabad"
    ],
    "busyDays": [
      4,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Kunal Mehta is a certified specialist in Orthopedics at MediConnect Hyderabad with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-24",
    "id": "doc-24",
    "name": "Dr. Deepika Nair",
    "department": "Pediatrics",
    "specialty": "Pediatrics",
    "specialization": "Pediatrics",
    "location": "Mumbai",
    "locations": [
      "Mumbai"
    ],
    "busyDays": [
      1,
      3
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Deepika Nair is a certified specialist in Pediatrics at MediConnect Mumbai with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-25",
    "id": "doc-25",
    "name": "Dr. Sameer Khan",
    "department": "Dermatology",
    "specialty": "Dermatology",
    "specialization": "Dermatology",
    "location": "Delhi",
    "locations": [
      "Delhi"
    ],
    "busyDays": [
      2,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Sameer Khan is a certified specialist in Dermatology at MediConnect Delhi with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-26",
    "id": "doc-26",
    "name": "Dr. Ishita Verma",
    "department": "General Medicine",
    "specialty": "General Medicine",
    "specialization": "General Medicine",
    "location": "Bengaluru",
    "locations": [
      "Bengaluru"
    ],
    "busyDays": [
      1,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Ishita Verma is a certified specialist in General Medicine at MediConnect Bengaluru with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-27",
    "id": "doc-27",
    "name": "Dr. Rohit Kapoor",
    "department": "Gynecology",
    "specialty": "Gynecology",
    "specialization": "Gynecology",
    "location": "Chennai",
    "locations": [
      "Chennai"
    ],
    "busyDays": [
      3,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Rohit Kapoor is a certified specialist in Gynecology at MediConnect Chennai with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-28",
    "id": "doc-28",
    "name": "Dr. Swati Patel",
    "department": "ENT",
    "specialty": "ENT",
    "specialization": "ENT",
    "location": "Pune",
    "locations": [
      "Pune"
    ],
    "busyDays": [
      1,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Swati Patel is a certified specialist in ENT at MediConnect Pune with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-29",
    "id": "doc-29",
    "name": "Dr. Abhishek Reddy",
    "department": "Ophthalmology",
    "specialty": "Ophthalmology",
    "specialization": "Ophthalmology",
    "location": "Kolkata",
    "locations": [
      "Kolkata"
    ],
    "busyDays": [
      2,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Abhishek Reddy is a certified specialist in Ophthalmology at MediConnect Kolkata with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-30",
    "id": "doc-30",
    "name": "Dr. Tanya Singh",
    "department": "Psychiatry",
    "specialty": "Psychiatry",
    "specialization": "Psychiatry",
    "location": "Ahmedabad",
    "locations": [
      "Ahmedabad"
    ],
    "busyDays": [
      3,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Tanya Singh is a certified specialist in Psychiatry at MediConnect Ahmedabad with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-31",
    "id": "doc-31",
    "name": "Dr. Nikhil Shah",
    "department": "Cardiology",
    "specialty": "Cardiology",
    "specialization": "Cardiology",
    "location": "Mumbai",
    "locations": [
      "Mumbai"
    ],
    "busyDays": [
      4,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Nikhil Shah is a certified specialist in Cardiology at MediConnect Mumbai with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-32",
    "id": "doc-32",
    "name": "Dr. Divya Iyer",
    "department": "Neurology",
    "specialty": "Neurology",
    "specialization": "Neurology",
    "location": "Delhi",
    "locations": [
      "Delhi"
    ],
    "busyDays": [
      1,
      3
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Divya Iyer is a certified specialist in Neurology at MediConnect Delhi with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-33",
    "id": "doc-33",
    "name": "Dr. Rajiv Malhotra",
    "department": "Orthopedics",
    "specialty": "Orthopedics",
    "specialization": "Orthopedics",
    "location": "Bengaluru",
    "locations": [
      "Bengaluru"
    ],
    "busyDays": [
      2,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Rajiv Malhotra is a certified specialist in Orthopedics at MediConnect Bengaluru with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-34",
    "id": "doc-34",
    "name": "Dr. Simran Kaur",
    "department": "Pediatrics",
    "specialty": "Pediatrics",
    "specialization": "Pediatrics",
    "location": "Chennai",
    "locations": [
      "Chennai"
    ],
    "busyDays": [
      1,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Simran Kaur is a certified specialist in Pediatrics at MediConnect Chennai with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-35",
    "id": "doc-35",
    "name": "Dr. Akash Gupta",
    "department": "Dermatology",
    "specialty": "Dermatology",
    "specialization": "Dermatology",
    "location": "Pune",
    "locations": [
      "Pune"
    ],
    "busyDays": [
      3,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Akash Gupta is a certified specialist in Dermatology at MediConnect Pune with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-36",
    "id": "doc-36",
    "name": "Dr. Preeti Joshi",
    "department": "General Medicine",
    "specialty": "General Medicine",
    "specialization": "General Medicine",
    "location": "Kolkata",
    "locations": [
      "Kolkata"
    ],
    "busyDays": [
      1,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Preeti Joshi is a certified specialist in General Medicine at MediConnect Kolkata with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-37",
    "id": "doc-37",
    "name": "Dr. Naveen Kumar",
    "department": "Gynecology",
    "specialty": "Gynecology",
    "specialization": "Gynecology",
    "location": "Ahmedabad",
    "locations": [
      "Ahmedabad"
    ],
    "busyDays": [
      2,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Naveen Kumar is a certified specialist in Gynecology at MediConnect Ahmedabad with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-38",
    "id": "doc-38",
    "name": "Dr. Shreya Menon",
    "department": "ENT",
    "specialty": "ENT",
    "specialization": "ENT",
    "location": "Hyderabad",
    "locations": [
      "Hyderabad"
    ],
    "busyDays": [
      3,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Shreya Menon is a certified specialist in ENT at MediConnect Hyderabad with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-39",
    "id": "doc-39",
    "name": "Dr. Harish Rao",
    "department": "Ophthalmology",
    "specialty": "Ophthalmology",
    "specialization": "Ophthalmology",
    "location": "Mumbai",
    "locations": [
      "Mumbai"
    ],
    "busyDays": [
      4,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Harish Rao is a certified specialist in Ophthalmology at MediConnect Mumbai with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-40",
    "id": "doc-40",
    "name": "Dr. Monica Desai",
    "department": "Psychiatry",
    "specialty": "Psychiatry",
    "specialization": "Psychiatry",
    "location": "Delhi",
    "locations": [
      "Delhi"
    ],
    "busyDays": [
      1,
      3
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Monica Desai is a certified specialist in Psychiatry at MediConnect Delhi with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-41",
    "id": "doc-41",
    "name": "Dr. Vivek Patel",
    "department": "Cardiology",
    "specialty": "Cardiology",
    "specialization": "Cardiology",
    "location": "Chennai",
    "locations": [
      "Chennai"
    ],
    "busyDays": [
      2,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Vivek Patel is a certified specialist in Cardiology at MediConnect Chennai with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-42",
    "id": "doc-42",
    "name": "Dr. Padmini Nair",
    "department": "Neurology",
    "specialty": "Neurology",
    "specialization": "Neurology",
    "location": "Pune",
    "locations": [
      "Pune"
    ],
    "busyDays": [
      1,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Padmini Nair is a certified specialist in Neurology at MediConnect Pune with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-43",
    "id": "doc-43",
    "name": "Dr. Siddharth Mehta",
    "department": "Orthopedics",
    "specialty": "Orthopedics",
    "specialization": "Orthopedics",
    "location": "Kolkata",
    "locations": [
      "Kolkata"
    ],
    "busyDays": [
      3,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Siddharth Mehta is a certified specialist in Orthopedics at MediConnect Kolkata with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-44",
    "id": "doc-44",
    "name": "Dr. Lakshmi Reddy",
    "department": "Pediatrics",
    "specialty": "Pediatrics",
    "specialization": "Pediatrics",
    "location": "Ahmedabad",
    "locations": [
      "Ahmedabad"
    ],
    "busyDays": [
      1,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Lakshmi Reddy is a certified specialist in Pediatrics at MediConnect Ahmedabad with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-45",
    "id": "doc-45",
    "name": "Dr. Varsha Kapoor",
    "department": "Dermatology",
    "specialty": "Dermatology",
    "specialization": "Dermatology",
    "location": "Hyderabad",
    "locations": [
      "Hyderabad"
    ],
    "busyDays": [
      2,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Varsha Kapoor is a certified specialist in Dermatology at MediConnect Hyderabad with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-46",
    "id": "doc-46",
    "name": "Dr. Mohit Sharma",
    "department": "General Medicine",
    "specialty": "General Medicine",
    "specialization": "General Medicine",
    "location": "Mumbai",
    "locations": [
      "Mumbai"
    ],
    "busyDays": [
      3,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Mohit Sharma is a certified specialist in General Medicine at MediConnect Mumbai with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-47",
    "id": "doc-47",
    "name": "Dr. Renuka Singh",
    "department": "Gynecology",
    "specialty": "Gynecology",
    "specialization": "Gynecology",
    "location": "Delhi",
    "locations": [
      "Delhi"
    ],
    "busyDays": [
      4,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Renuka Singh is a certified specialist in Gynecology at MediConnect Delhi with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-48",
    "id": "doc-48",
    "name": "Dr. Ashwin Kumar",
    "department": "ENT",
    "specialty": "ENT",
    "specialization": "ENT",
    "location": "Bengaluru",
    "locations": [
      "Bengaluru"
    ],
    "busyDays": [
      1,
      3
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Ashwin Kumar is a certified specialist in ENT at MediConnect Bengaluru with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-49",
    "id": "doc-49",
    "name": "Dr. Swara Shah",
    "department": "Ophthalmology",
    "specialty": "Ophthalmology",
    "specialization": "Ophthalmology",
    "location": "Chennai",
    "locations": [
      "Chennai"
    ],
    "busyDays": [
      2,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Swara Shah is a certified specialist in Ophthalmology at MediConnect Chennai with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-50",
    "id": "doc-50",
    "name": "Dr. Yash Verma",
    "department": "Psychiatry",
    "specialty": "Psychiatry",
    "specialization": "Psychiatry",
    "location": "Pune",
    "locations": [
      "Pune"
    ],
    "busyDays": [
      1,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Yash Verma is a certified specialist in Psychiatry at MediConnect Pune with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-51",
    "id": "doc-51",
    "name": "Dr. Tanvi Agarwal",
    "department": "Cardiology",
    "specialty": "Cardiology",
    "specialization": "Cardiology",
    "location": "Ahmedabad",
    "locations": [
      "Ahmedabad"
    ],
    "busyDays": [
      3,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Tanvi Agarwal is a certified specialist in Cardiology at MediConnect Ahmedabad with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-52",
    "id": "doc-52",
    "name": "Dr. Rakesh Iyer",
    "department": "Neurology",
    "specialty": "Neurology",
    "specialization": "Neurology",
    "location": "Hyderabad",
    "locations": [
      "Hyderabad"
    ],
    "busyDays": [
      1,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Rakesh Iyer is a certified specialist in Neurology at MediConnect Hyderabad with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-53",
    "id": "doc-53",
    "name": "Dr. Namita Joshi",
    "department": "Orthopedics",
    "specialty": "Orthopedics",
    "specialization": "Orthopedics",
    "location": "Mumbai",
    "locations": [
      "Mumbai"
    ],
    "busyDays": [
      2,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Namita Joshi is a certified specialist in Orthopedics at MediConnect Mumbai with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-54",
    "id": "doc-54",
    "name": "Dr. Sanjay Menon",
    "department": "Pediatrics",
    "specialty": "Pediatrics",
    "specialization": "Pediatrics",
    "location": "Delhi",
    "locations": [
      "Delhi"
    ],
    "busyDays": [
      3,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Sanjay Menon is a certified specialist in Pediatrics at MediConnect Delhi with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-55",
    "id": "doc-55",
    "name": "Dr. Kritika Rao",
    "department": "Dermatology",
    "specialty": "Dermatology",
    "specialization": "Dermatology",
    "location": "Bengaluru",
    "locations": [
      "Bengaluru"
    ],
    "busyDays": [
      4,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Kritika Rao is a certified specialist in Dermatology at MediConnect Bengaluru with over 20 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-56",
    "id": "doc-56",
    "name": "Dr. Sameera Patel",
    "department": "General Medicine",
    "specialty": "General Medicine",
    "specialization": "General Medicine",
    "location": "Chennai",
    "locations": [
      "Chennai"
    ],
    "busyDays": [
      1,
      3
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "8+ Years",
    "rating": 4.5,
    "consultationFee": "₹500",
    "about": "Dr. Sameera Patel is a certified specialist in General Medicine at MediConnect Chennai with over 8 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-57",
    "id": "doc-57",
    "name": "Dr. Harsh Mehta",
    "department": "Gynecology",
    "specialty": "Gynecology",
    "specialization": "Gynecology",
    "location": "Pune",
    "locations": [
      "Pune"
    ],
    "busyDays": [
      2,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "11+ Years",
    "rating": 4.6,
    "consultationFee": "₹500",
    "about": "Dr. Harsh Mehta is a certified specialist in Gynecology at MediConnect Pune with over 11 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-58",
    "id": "doc-58",
    "name": "Dr. Divya Reddy",
    "department": "ENT",
    "specialty": "ENT",
    "specialization": "ENT",
    "location": "Kolkata",
    "locations": [
      "Kolkata"
    ],
    "busyDays": [
      1,
      4
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "14+ Years",
    "rating": 4.7,
    "consultationFee": "₹500",
    "about": "Dr. Divya Reddy is a certified specialist in ENT at MediConnect Kolkata with over 14 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-59",
    "id": "doc-59",
    "name": "Dr. Manav Shah",
    "department": "Ophthalmology",
    "specialty": "Ophthalmology",
    "specialization": "Ophthalmology",
    "location": "Ahmedabad",
    "locations": [
      "Ahmedabad"
    ],
    "busyDays": [
      3,
      0
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "17+ Years",
    "rating": 4.8,
    "consultationFee": "₹500",
    "about": "Dr. Manav Shah is a certified specialist in Ophthalmology at MediConnect Ahmedabad with over 17 years of dedicated clinical practice."
  },
  {
    "doctorId": "doc-60",
    "id": "doc-60",
    "name": "Dr. Radhika Nair",
    "department": "Psychiatry",
    "specialty": "Psychiatry",
    "specialization": "Psychiatry",
    "location": "Hyderabad",
    "locations": [
      "Hyderabad"
    ],
    "busyDays": [
      1,
      5
    ],
    "availableTimeSlots": [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM"
    ],
    "experience": "20+ Years",
    "rating": 4.9,
    "consultationFee": "₹500",
    "about": "Dr. Radhika Nair is a certified specialist in Psychiatry at MediConnect Hyderabad with over 20 years of dedicated clinical practice."
  }
];

/**
 * Format doctor name so that 'Dr.' appears only once.
 */
export function formatDoctorName(name) {
  if (!name) return "";
  const cleaned = name.replace(/^(Dr\.?\s*)+/i, "").trim();
  return "Dr. " + cleaned;
}

/**
 * Format date display: converts YYYY-MM-DD to DD-MM-YYYY or returns trimmed date.
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  if (typeof dateStr !== "string") return String(dateStr);
  const trimmed = dateStr.trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = String(isoMatch[2]).padStart(2, "0");
    const d = String(isoMatch[3]).padStart(2, "0");
    return d + "-" + m + "-" + y;
  }
  return trimmed;
}

/**
 * Filter doctors by department and location.
 */
export function filterDoctors(department, location) {
  if (!department && !location) return DOCTORS;
  return DOCTORS.filter(doc => {
    const deptMatch = !department || 
      doc.department.toLowerCase() === department.toLowerCase() ||
      doc.specialty.toLowerCase() === department.toLowerCase() ||
      doc.specialization.toLowerCase() === department.toLowerCase();
    const locMatch = !location || 
      doc.location.toLowerCase() === location.toLowerCase() ||
      (doc.locations && doc.locations.some(l => l.toLowerCase() === location.toLowerCase()));
    return deptMatch && locMatch;
  });
}

/**
 * Get doctor by ID or name.
 */
export function getDoctorById(id) {
  if (!id) return null;
  return DOCTORS.find(d => 
    d.doctorId === id || 
    d.id === id || 
    d.name.toLowerCase() === id.toLowerCase() ||
    d.name.toLowerCase().replace(/^(Dr\.?\s*)+/i, "") === id.toLowerCase().replace(/^(Dr\.?\s*)+/i, "")
  ) || null;
}

/**
 * Parse a date string into a local day of week (0 = Sun, 1 = Mon, ..., 6 = Sat).
 */
export function getDayOfWeekFromDateString(dateString) {
  if (!dateString) return -1;
  if (dateString instanceof Date) return dateString.getDay();

  if (typeof dateString === "string") {
    const trimmed = dateString.trim();
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      return new Date(year, month, day).getDay();
    }

    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
      const year = parseInt(ddmmyyyyMatch[3], 10);
      return new Date(year, month, day).getDay();
    }

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.getDay();
    }
  }

  return -1;
}

/**
 * Check whether a doctor is available on a given date string.
 * Returns true if the date does NOT fall on one of the doctor's busy days.
 */
export function isDoctorAvailable(doctorId, dateString) {
  if (!doctorId || !dateString) return false;
  const doctor = getDoctorById(doctorId);
  if (!doctor) return false;

  const dayOfWeek = getDayOfWeekFromDateString(dateString);
  if (dayOfWeek === -1 || isNaN(dayOfWeek)) return false;

  return !doctor.busyDays.includes(dayOfWeek);
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getDoctorBusyDayNames(doctorId) {
  const doctor = getDoctorById(doctorId);
  if (!doctor) return [];
  return doctor.busyDays.map(d => DAY_NAMES[d]);
}

export default DOCTORS;
