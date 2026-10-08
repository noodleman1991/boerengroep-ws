/* eslint-disable @next/next/no-img-element */

// One admin panel looks after both websites, so it carries both names and both symbols: the
// swirl of each logo, the same files the sites use.
const SYMBOL = '/brand/boerengroep-symbol.svg'
const SECOND_SYMBOL = '/brand/inspringtheater-symbol.svg'

/** The small mark in the corner of every screen. */
export function AdminIcon() {
  return <img className="admin-icon" src={SYMBOL} alt="" width={20} height={25} />
}

/** The large panel beside the login form. */
export function AdminLogo() {
  return (
    <div className="admin-brand">
      <div className="admin-brand__symbols">
        <img className="admin-brand__symbol" src={SYMBOL} alt="" width={330} height={411} />
        <img className="admin-brand__symbol" src={SECOND_SYMBOL} alt="" width={633} height={707} />
      </div>
      <p className="admin-brand__name">
        Boerengroep <span>and</span> Inspringtheater
      </p>
      <p className="admin-brand__line">One place to keep both websites up to date.</p>
    </div>
  )
}

/** What stands above the login form. */
export function LoginWelcome() {
  return (
    <div className="login-welcome">
      <h1>Log in</h1>
      <p>Use the email address and password you were given. Forgot the password? The link under the form sends you a new one.</p>
    </div>
  )
}
