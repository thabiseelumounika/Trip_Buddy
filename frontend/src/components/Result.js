import React from "react";

function Result({ data }) {
  if (!data) return null;

  const totalCost = data.budget / data.members;

  return (
    <div>
      <h2>Trip Plan</h2>
      <p>From: {data.from}</p>
      <p>To: {data.to}</p>
      <p>Days: {data.days}</p>
      <p>Members: {data.members}</p>
      <p>Cost per person: ₹{totalCost}</p>
    </div>
  );
}

export default Result;