(function () {
  "use strict";

  var SUPPORT_EMAIL = "mohamed.ben.206720@gmail.com";
  // Web3Forms' access key is designed to be used exactly like this — from
  // client-side JS on a static page with no backend. It's a public form
  // identifier (like a Formspree form ID), not a secret credential; it only
  // authorizes submissions *into* this specific form, nothing more.
  var WEB3FORMS_ACCESS_KEY = "d82a85ce-ef77-44e2-a398-cbeb9846c12e";

  var form = document.getElementById("support-form");
  var note = document.getElementById("form-note");
  var submitBtn = document.getElementById("submit-btn");
  var defaultNote = note ? note.textContent : "";

  if (!form) return;

  function setNote(text, kind) {
    note.textContent = text;
    note.classList.remove("error", "success");
    if (kind) note.classList.add(kind);
  }

  function mailtoFallbackLink(name, email, topic, message) {
    var subject = "Ovenbird Support — " + topic;
    var body = "From: " + (name || "(no name given)") + " <" + email + ">\n\n" + message;
    return (
      "mailto:" + encodeURIComponent(SUPPORT_EMAIL) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body)
    );
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var topic = document.getElementById("topic").value;
    var message = document.getElementById("message").value.trim();
    var botcheck = document.getElementById("botcheck").value;

    if (!email || !message) {
      setNote("Please fill in your email and a message before sending.", "error");
      return;
    }

    // Silently "succeed" on a filled honeypot instead of telling a bot it
    // was caught — real users never see or fill this field in.
    if (botcheck) {
      form.reset();
      setNote("Thanks — your message has been sent.", "success");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setNote(defaultNote, null);

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: "Ovenbird Support — " + topic,
        from_name: name || "Ovenbird support form",
        name: name,
        email: email,
        topic: topic,
        message: message,
      }),
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send feedback";
        if (data.success) {
          form.reset();
          setNote("Thanks — your message has been sent. We'll reply to " + email + ".", "success");
        } else {
          throw new Error(data.message || "Submission failed");
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send feedback";
        var link = mailtoFallbackLink(name, email, topic, message);
        note.innerHTML =
          "Couldn't reach our server — " +
          '<a href="' + link + '">click here to send this by email instead</a>.';
        note.classList.add("error");
      });
  });
})();
