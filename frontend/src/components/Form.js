import React, { useState } from "react";

function Form({ setData }) {
  const [form, setForm] = useState({
    from: "",
    to: "",
    days: "",
    members: "",
    budget: "",
    season: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setData(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="from" placeholder="Starting Point" onChange={handleChange} />
      <input name="to" placeholder="Destination" onChange={handleChange} />
      <input name="days" placeholder="Days" onChange={handleChange} />
      <input name="members" placeholder="Members" onChange={handleChange} />
      <input name="budget" placeholder="Budget" onChange={handleChange} />
      <input name="season" placeholder="Season" onChange={handleChange} />

      <button type="submit">Plan Trip</button>
    </form>
  );
}

export default Form;