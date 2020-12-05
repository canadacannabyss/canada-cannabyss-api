class GstHst {
  private subtotal: number

  constructor(subtotal: number) {
    this.subtotal = subtotal
  }

  calculateGstHst() {
    // return this.subtotal * 0.05
    return this.subtotal * 0
  }
}

export default GstHst
