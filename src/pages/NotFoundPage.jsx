import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page-shell">
      <h1>404</h1>
      <p>Không tìm thấy trang.</p>
      <Link className="nav-link" to="/">
        Quay về trang chủ
      </Link>
    </section>
  )
}

export default NotFoundPage
