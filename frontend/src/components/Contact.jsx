import React from "react";
import Swal from "sweetalert2";


const Contact = () => {
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    formData.append("access_key", "ba056918-ac30-4901-9a74-b2e9f65e44c1");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    }).then((res) => res.json());

    if (res.success) {
      Swal.fire({
        title: "Success!",
        text: "Message sent successfully!",
        icon: "success",
      });
    }
  };

  return (
    <section className="contact py-5 my-3">
      <form className="form-contact shadow-lg" onSubmit={onSubmit}>
        <h2>Contact me</h2>
        <div className="input-box">
          <label>Full Name</label>
          <input
            type="text"
            className="field"
            placeholder="Enter your name"
            name="name"
            required
          />
        </div>
        <div className="input-box">
          <label>Email Address</label>
          <input
            type="text"
            className="field"
            placeholder="Enter your email"
            name="email"
            required
          />
        </div>
        <div className="input-box">
          <label>Your Message</label>
          <input
            name="message"
            type="text"
            className="field mess"
            placeholder="Enter your message"
            required
          />
        </div>
        <button className="c-btn" type="submit">Send Message</button>
      </form>
    </section>
  );
};

export default Contact;
