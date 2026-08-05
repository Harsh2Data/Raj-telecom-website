/* Submit the contact form to the local Raj Telecom API. */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    var submit = form.querySelector('button[type="submit"]');
    var status = form.querySelector('.form-status');
    var initialLabel = submit.textContent;
    var phone = document.getElementById('phone').value.replace(/\D/g, '');
    submit.disabled = true;
    submit.textContent = 'Sending message...';
    if (status) status.textContent = 'Sending your repair request to Raj Telecom...';

    try {
      await window.RajTelecomAPI.createLead({
        name: document.getElementById('name').value.trim(),
        phone: phone,
        brand: 'Other',
        model: document.getElementById('device').value.trim() || 'Not specified',
        issue: document.getElementById('issue').value,
        message: document.getElementById('message').value.trim()
      });
      form.reset();
      if (status) status.textContent = 'Request sent. Raj Telecom will contact you soon.';
      submit.textContent = 'Message sent';
    } catch (error) {
      if (status) status.textContent = error.message + ' Please check that the local backend is running.';
      submit.disabled = false;
      submit.textContent = initialLabel;
      return;
    }

    setTimeout(function () {
      submit.disabled = false;
      submit.textContent = initialLabel;
    }, 3000);
  }, true);
});
