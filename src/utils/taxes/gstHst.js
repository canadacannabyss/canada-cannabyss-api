class GstHst {
  constructor(subtotal) {
    this.subtotal = subtotal;
  }

  calculateGstHst() {
    return this.subtotal * 0.05;
  }
}

module.exports = GstHst;
