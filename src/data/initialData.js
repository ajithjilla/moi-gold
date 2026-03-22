export const initialEvents = [
  { id: 1, name: "Murugan & Kavitha Wedding", type: "wedding", date: "2025-02-10", venue: "Madurai Palace", owner: "Murugan S", ownerPhone: "9876543210", ownerEmail: "murugan@gmail.com", affiliateId: 1, status: "completed" },
  { id: 2, name: "Priya's Ear Piercing Ceremony", type: "ear", date: "2025-02-18", venue: "Chennai Community Hall", owner: "Rajesh P", ownerPhone: "9865432100", ownerEmail: "rajesh@gmail.com", affiliateId: 1, status: "active" },
  { id: 3, name: "Karthik & Deepa Engagement", type: "engagement", date: "2025-03-05", venue: "Coimbatore Convention", owner: "Karthik R", ownerPhone: "9823456710", ownerEmail: "karthik@gmail.com", affiliateId: 2, status: "upcoming" },
];

export const initialMoi = [
  { id: 1, eventId: 1, name: "Anbu Selvan", amount: 2000, phone: "9876501234", address: "12, Anna Nagar, Chennai", relation: "Uncle", method: "Cash", note: "Blessings" },
  { id: 2, eventId: 1, name: "Muthu Lakshmi", amount: 5000, phone: "9865430012", address: "5, Gandhi St, Madurai", relation: "Friend", method: "GPay", note: "" },
  { id: 3, eventId: 1, name: "Subramanian K", amount: 1500, phone: "9812345678", address: "78, Nehru Road, Trichy", relation: "Colleague", method: "Cash", note: "With love" },
  { id: 4, eventId: 2, name: "Viji Ramasamy", amount: 3000, phone: "9800123456", address: "3, Temple St, Thanjavur", relation: "Aunt", method: "Cash", note: "" },
  { id: 5, eventId: 2, name: "Durai Murugan", amount: 500, phone: "9755432100", address: "22, Main Road, Salem", relation: "Neighbor", method: "PhonePe", note: "" },
];

export const initialAffiliates = [
  { id: 1, name: "Ravi Kumar", email: "ravi@gmail.com", phone: "9811234567", plan: "pro", status: "active", joinDate: "2024-11-01", eventsCount: 12, revenue: 3600 },
  { id: 2, name: "Prabhakaran S", email: "prabha@gmail.com", phone: "9822345678", plan: "basic", status: "active", joinDate: "2024-12-15", eventsCount: 5, revenue: 1500 },
  { id: 3, name: "Sivakami R", email: "siva@gmail.com", phone: "9833456789", plan: "pro", status: "pending", joinDate: "2025-01-20", eventsCount: 0, revenue: 0 },
];
