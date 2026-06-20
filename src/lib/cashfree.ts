declare global {
  interface Window { Cashfree: any }
}

export async function loadCashfreeSDK(): Promise<void> {
  if (window.Cashfree) return
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export async function startCashfreePayment(paymentSessionId: string, returnUrl: string) {
  await loadCashfreeSDK()
  const mode = import.meta.env.VITE_CASHFREE_MODE === 'production' ? 'production' : 'sandbox'
  const cashfree = await window.Cashfree({ mode })
  cashfree.checkout({ paymentSessionId, returnUrl })
}
