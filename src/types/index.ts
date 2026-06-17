// types/index.ts
export interface Book {
  id: number
  title: string
  author: string
  stock: number
  cover_url: string | null
  created_at: string
}

export interface BookInput {
  title: string
  author: string
  stock: number
  cover_url?: string
}

export interface Loan {
  id: number
  book_id: number
  books?: {  // Perhatikan: pake 'books' karena nama relasi di Supabase
    id: number
    title: string
    author: string
    stock: number
    cover_url: string | null
  }
  borrower_name: string
  borrow_date: string
  due_date: string
  returned: boolean
  created_at: string
}
export interface LoanInput {
  book_id: number
  borrower_name: string
  due_date: string
}

export interface DashboardStats {
  totalBooks: number
  borrowedBooks: number
  availableBooks: number
  activeLoans: number
  overdueLoans: number
}