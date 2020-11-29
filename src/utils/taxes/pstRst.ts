class PstRst {
  private province: string
  private subtotal: number

  constructor(province: string, totalBeforeTax: number) {
    this.province = province
    this.subtotal = totalBeforeTax
  }

  calculatePstRst() {
    let hstTaxPercent = 0
    switch (this.province) {
      case 'QC':
        hstTaxPercent = 0.05
        break
      case 'AB':
        hstTaxPercent = 0.05
        break
      case 'BC':
        hstTaxPercent = 0.05
        break
      case 'MB':
        hstTaxPercent = 0.05
        break
      case 'NT':
        hstTaxPercent = 0.05
        break
      case 'NU':
        hstTaxPercent = 0.05
        break
      case 'SK':
        hstTaxPercent = 0.05
        break
      case 'YT':
        hstTaxPercent = 0.05
        break
      case 'ON':
        hstTaxPercent = 0.13
        break
      case 'NB':
        hstTaxPercent = 0.15
        break
      case 'NL':
        hstTaxPercent = 0.05
        break
      case 'NS':
        hstTaxPercent = 0.15
        break
      case 'PE':
        hstTaxPercent = 0.15
        break
    }
    return parseFloat((this.subtotal * hstTaxPercent).toFixed(2))
  }
}

export default PstRst
