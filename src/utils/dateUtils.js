// Tarih formatı için yardımcı fonksiyon
export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Para birimi formatı için yardımcı fonksiyon
export const formatPrice = (price) => {
  if (!price && price !== 0) return ''
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}
