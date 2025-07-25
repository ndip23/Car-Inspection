// src/api/mockData.js

export const vehicles = [
  {
    _id: "63f8b3b1f1b2b3b4b5b6b7b8",
    license_plate: "AB-123-CD",
    make: "Tesla",
    model: "Model 3",
    year: 2021,
    owner_name: "John Doe",
    owner_phone: "555-1234",
    owner_email: "john.doe@email.com",
  },
  {
    _id: "63f8b3b1f1b2b3b4b5b6b7b9",
    license_plate: "EF-456-GH",
    make: "Renault",
    model: "Clio",
    year: 2019,
    owner_name: "Jane Smith",
    owner_phone: "555-5678",
    owner_email: "jane.smith@email.com",
  },
];

export const inspections = {
  "63f8b3b1f1b2b3b4b5b6b7b8": [
    {
      _id: "insp_1",
      vehicle_id: "63f8b3b1f1b2b3b4b5b6b7b8",
      date: "2023-01-15T10:00:00Z",
      inspector_name: "Alice",
      result: "pass",
      notes: "All systems nominal. Brakes at 80%.",
      next_due_date: "2025-01-15T10:00:00Z",
    },
  ],
  "63f8b3b1f1b2b3b4b5b6b7b9": [
    {
      _id: "insp_2",
      vehicle_id: "63f8b3b1f1b2b3b4b5b6b7b9",
      date: "2022-11-20T14:30:00Z",
      inspector_name: "Bob",
      result: "fail",
      notes: "Front left tire pressure low. Exhaust emissions exceed limits.",
      next_due_date: "2022-12-20T14:30:00Z",
    },
    {
      _id: "insp_3",
      vehicle_id: "63f8b3b1f1b2b3b4b5b6b7b9",
      date: "2022-12-10T09:00:00Z",
      inspector_name: "Alice",
      result: "pass",
      notes: "Issues resolved. Vehicle is compliant.",
      next_due_date: "2024-12-10T09:00:00Z",
    },
  ],
};