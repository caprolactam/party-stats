/**
 * source: https://www.jacobparis.com/content/remix-pagination
 */
export function createPageNumber({
  currentPage,
  totalPages,
  maxDisplayPages = 5,
}: {
  currentPage: number
  totalPages: number
  maxDisplayPages?: number
}) {
  const halfDisplayPages = Math.floor(maxDisplayPages / 2)

  const canPageBackwards = currentPage > 1
  const canPageForwards = currentPage < totalPages

  const pageNumbers = [] as Array<number>
  if (totalPages <= maxDisplayPages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    let startPage = currentPage - halfDisplayPages
    let endPage = currentPage + halfDisplayPages
    if (startPage < 1) {
      endPage += Math.abs(startPage) + 1
      startPage = 1
    }
    if (endPage > totalPages) {
      startPage -= endPage - totalPages
      endPage = totalPages
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
  }

  return {
    pageNumbers,
    canPageBackwards,
    canPageForwards,
  }
}
