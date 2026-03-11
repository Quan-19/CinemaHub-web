import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page-shell">
      <h1>404</h1>
      <p>Khong tim thay trang.</p>
      <Link className="nav-link" to="/">
        Quay ve home
      </Link>
    </section>
  )
}

export default NotFoundPage
