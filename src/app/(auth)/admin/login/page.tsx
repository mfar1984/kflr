export default function AdminLoginPage() {
  return (
    <main className="section container" style={{ maxWidth: 480 }}>
      <h1 className="mb-3">Admin Login</h1>
      <form className="row g-3">
        <div className="col-12">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control" id="email" placeholder="you@example.com" />
        </div>
        <div className="col-12">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" id="password" placeholder="••••••••" />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Sign in</button>
        </div>
      </form>
    </main>
  );
}


