window.RajTelecomAPI = {

  createLead: async function (lead) {

    var response = await fetch('https://raj-telecom-website.onrender.com/api/lead', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(lead)

    });

    var data = await response.json().catch(function () {
      return {};
    });

    if (!response.ok || !data.success) {

      throw new Error(
        data.message ||
        'We could not send your request. Please try again.'
      );

    }

    return data;

  },

  confirmBooking: async function (booking) {

    var response = await fetch('https://raj-telecom-website.onrender.com/api/confirm', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(booking)

    });

    var data = await response.json().catch(function () {
      return {};
    });

    if (!response.ok || !data.success) {

      throw new Error(
        data.message ||
        'Booking confirmation failed.'
      );

    }

    return data;

  }

};