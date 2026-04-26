export default {
  availability: null,
  verificationCode: null,

  init: function () {
    const params = new URLSearchParams(window.location.search);
    const encodedAvailability = params.get('a');
    const encodedVerificationCode = params.get('v');

    if (!encodedAvailability || !encodedVerificationCode) throw 'invalid parameters';

    this.availability = JSON.parse(atob(encodedAvailability));
    this.verificationCode = atob(encodedVerificationCode);
  }
};