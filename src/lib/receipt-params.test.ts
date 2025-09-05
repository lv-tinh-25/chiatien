import { parseReceiptParams } from '@/lib/receipt-params'

const params = (query: string) => new URLSearchParams(query)

describe('parseReceiptParams', () => {
  it('ignores a link with no uploaded image', () => {
    expect(parseReceiptParams(params('title=Taxi&amount=12'))).toBeNull()
  })

  it('ignores a settlement link, whose amount is in minor units', () => {
    expect(
      parseReceiptParams(
        params('reimbursement=1&amount=2500&imageUrl=https://s3/a.png'),
      ),
    ).toBeNull()
  })

  it('reads the whole draft', () => {
    expect(
      parseReceiptParams(
        params(
          'title=Grocery%20run&amount=12.34&categoryId=7&date=2026-03-15' +
            '&imageUrl=https%3A%2F%2Fs3%2Fa.png&imageWidth=800&imageHeight=600',
        ),
      ),
    ).toEqual({
      title: 'Grocery run',
      amount: '12.34',
      categoryId: 7,
      date: new Date('2026-03-15'),
      document: { url: 'https://s3/a.png', width: 800, height: 600 },
    })
  })

  it('falls back to the general category and no date when the scan found neither', () => {
    const draft = parseReceiptParams(
      params('imageUrl=https://s3/a.png&categoryId=NaN&date=undefined'),
    )
    expect(draft?.categoryId).toBe(0)
    expect(draft?.date).toBeNull()
  })

  it('drops an image with no dimensions rather than storing a broken document', () => {
    const draft = parseReceiptParams(params('imageUrl=https://s3/a.png'))
    expect(draft?.document).toBeNull()
  })

  it('leaves the amount empty when the scan could not read one', () => {
    const draft = parseReceiptParams(
      params('imageUrl=https://s3/a.png&amount=0'),
    )
    expect(draft?.amount).toBe('')
  })
})
