import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Box, Check, ChevronRight, CircleAlert, Clock3,
  Globe2, LayoutDashboard, LogOut, MapPin, Menu, PackageCheck, Plus,
  Search, ShieldCheck, Ship, Truck, UserRound, X
} from 'lucide-react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query,
  serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './firebase'

const CONTACT_EMAIL = 'Dehublogistics0@gmail.com'

const statusOptions = [
  'Shipment created',
  'Received at facility',
  'In transit',
  'Customs processing',
  'Out for delivery',
  'Delivered',
  'Delayed',
]

const demoShipment = {
  trackingNumber: 'DEH-2026-000001',
  description: 'General merchandise',
  origin: 'Lagos, Nigeria',
  destination: 'London, United Kingdom',
  receiverName: 'Michael Brown',
  receiverPhone: '+44 000 000 0000',
  receiverAddress: '24 Example Street, London, United Kingdom',
  weight: '4.5 kg',
  status: 'In transit',
  service: 'International Express',
  estimatedDelivery: '26 September 2026',
  updatedAt: '21 September 2026, 10:30',
  events: [
    {
      status: 'In transit',
      location: 'International Transit Hub',
      note: 'Shipment is moving to the destination country.',
      date: '21 Sep 2026',
      time: '10:30',
    },
    {
      status: 'Received at facility',
      location: 'Lagos Processing Centre',
      note: 'Shipment received and processed.',
      date: '20 Sep 2026',
      time: '16:45',
    },
    {
      status: 'Shipment created',
      location: 'Lagos, Nigeria',
      note: 'Shipment information received.',
      date: '20 Sep 2026',
      time: '09:15',
    },
  ],
}

const emptyForm = {
  trackingNumber: '',
  description: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  weight: '',
  origin: '',
  destination: '',
  status: 'Shipment created',
  service: 'Standard Delivery',
  estimatedDelivery: '',
  publicNote: '',
  currentLocation: '',
}

function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-mark"><Truck size={24} /></span>
      <span><strong>Dehub</strong><small>Logistics Services</small></span>
    </div>
  )
}

function Header({ onTrack }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <a href="#home" aria-label="Dehub Logistics home"><Brand /></a>
        <nav className={open ? 'nav-open' : ''} aria-label="Main navigation">
          <a href="#home" onClick={() => setOpen(false)}>Home</a>
          <a href="#services" onClick={() => setOpen(false)}>Services</a>
          <a href="#about" onClick={() => setOpen(false)}>About us</a>
          <button className="nav-track" onClick={() => { onTrack(); setOpen(false) }}>
            Track shipment <ArrowRight size={18} />
          </button>
        </nav>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}

function TrackingSearch({ initial = '', large = false, onResult }) {
  const [value, setValue] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e?.preventDefault()
    const number = value.trim().toUpperCase()
    if (!number) return setError('Please enter your tracking number.')

    setLoading(true)
    setError('')

    try {
      if (!isFirebaseConfigured && number === demoShipment.trackingNumber) {
        onResult(demoShipment)
        return
      }

      if (!isFirebaseConfigured) throw new Error('Demo mode: use DEH-2026-000001')

      const shipmentRef = doc(db, 'public_tracking', number)
      const snapshot = await getDoc(shipmentRef)

      if (!snapshot.exists()) {
        throw new Error('We could not find that tracking number. Please check it and try again.')
      }

      onResult(snapshot.data())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={`tracking-form ${large ? 'tracking-form-large' : ''}`} onSubmit={submit}>
      <label htmlFor={large ? 'hero-tracking' : 'page-tracking'}>Tracking number</label>
      <div className="tracking-input-row">
        <span className="input-icon"><Search size={22} /></span>
        <input
          id={large ? 'hero-tracking' : 'page-tracking'}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="e.g. DEH-2026-000001"
          autoComplete="off"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Track package'} <ArrowRight size={20} />
        </button>
      </div>
      {error && <p className="form-error"><CircleAlert size={18} />{error}</p>}
      {!isFirebaseConfigured && (
        <p className="demo-hint">
          Preview tracking number:{' '}
          <button type="button" onClick={() => setValue(demoShipment.trackingNumber)}>
            DEH-2026-000001
          </button>
        </p>
      )}
    </form>
  )
}

function Home({ navigate }) {
  return (
    <>
      <Header onTrack={() => navigate('track')} />
      <main>
        <section className="hero" id="home">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><Globe2 size={18} /> Delivering across borders</p>
              <h1>Every shipment,<br /><span>clearly tracked.</span></h1>
              <p className="hero-lead">
                Simple, dependable logistics for packages moving across countries. Know where your shipment is, every step of the way.
              </p>
              <TrackingSearch large onResult={shipment => navigate('track', shipment)} />
            </div>

            <div className="route-card" aria-label="International delivery illustration">
              <div className="route-top"><span>LIVE ROUTE</span><span className="live-dot">In transit</span></div>
              <div className="route-map">
                <span className="map-dot dot-one" />
                <span className="map-line" />
                <span className="map-truck"><Truck /></span>
                <span className="map-dot dot-two" />
              </div>
              <div className="route-places">
                <span><small>FROM</small>Lagos</span><strong>→</strong><span><small>TO</small>London</span>
              </div>
              <div className="route-progress"><span /></div>
              <p><Clock3 size={18} /> Estimated arrival: <strong>26 September</strong></p>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Service assurances">
          <div><ShieldCheck /><span><strong>Secure handling</strong><small>Protected at every step</small></span></div>
          <div><Globe2 /><span><strong>International reach</strong><small>Across multiple countries</small></span></div>
          <div><Clock3 /><span><strong>Clear updates</strong><small>Easy-to-follow tracking</small></span></div>
        </section>

        <section className="section services" id="services">
          <div className="section-heading">
            <p className="eyebrow">What we do</p>
            <h2>Delivery solutions made simple.</h2>
            <p>Whether it is one important package or regular business shipments, we help move it safely and keep you informed.</p>
          </div>
          <div className="service-grid">
            <article><span><PackageCheck /></span><h3>Package delivery</h3><p>Reliable door-to-door delivery with clear progress updates.</p></article>
            <article><span><Ship /></span><h3>International shipping</h3><p>Cross-border logistics coordinated from departure to arrival.</p></article>
            <article><span><Truck /></span><h3>Express service</h3><p>Priority handling for shipments that need to move quickly.</p></article>
          </div>
        </section>

        <section className="section about" id="about">
          <div className="about-panel">
            <p className="eyebrow">Why Dehub</p>
            <h2>Logistics without the confusion.</h2>
            <p>
              We believe shipment information should be easy for everyone to understand. Dehub combines dependable coordination with straightforward tracking, so customers can check progress without unnecessary steps.
            </p>
            <button onClick={() => navigate('track')}>Track a shipment <ChevronRight /></button>
          </div>
          <div className="steps">
            <div><strong>01</strong><span><b>Enter your number</b><small>Use the tracking number provided for your shipment.</small></span></div>
            <div><strong>02</strong><span><b>See the current status</b><small>View the latest location and delivery stage.</small></span></div>
            <div><strong>03</strong><span><b>Follow every update</b><small>Read the complete shipment journey in one place.</small></span></div>
          </div>
        </section>
      </main>
      <Footer navigate={navigate} />
    </>
  )
}

function Footer({ navigate }) {
  return (
    <footer>
      <div className="footer-grid">
        <Brand light />
        <p>
          Dependable logistics and clear shipment tracking across borders.<br />
          Contact us:{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 700 }}
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <button onClick={() => navigate('admin')} className="admin-link">
          <UserRound size={17} /> Staff login
        </button>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Dehub Logistics Services</span>
        <span>Built for clear, dependable delivery.</span>
      </div>
    </footer>
  )
}

function TrackingPage({ navigate, initialShipment }) {
  const [shipment, setShipment] = useState(initialShipment)

  return (
    <div className="light-page">
      <Header onTrack={() => {}} />
      <main className="tracking-page">
        <button className="back-link" onClick={() => navigate('home')}>
          <ArrowLeft size={18} /> Back to home
        </button>
        <div className="track-page-heading">
          <p className="eyebrow">Shipment tracking</p>
          <h1>Where is your package?</h1>
          <p>Enter the tracking number supplied with your shipment.</p>
        </div>
        <TrackingSearch onResult={setShipment} />
        {shipment && <ShipmentResult shipment={shipment} />}
      </main>
      <Footer navigate={navigate} />
    </div>
  )
}

function ShipmentResult({ shipment }) {
  const events = shipment.events || []
  const hasReceiverInfo = shipment.receiverName || shipment.receiverPhone || shipment.receiverAddress || shipment.weight

  return (
    <section className="shipment-result">
      <div className="status-banner">
        <span className="status-icon"><Truck /></span>
        <div>
          <small>CURRENT STATUS</small>
          <h2>{shipment.status}</h2>
          <p>Last updated {shipment.updatedAt || 'recently'}</p>
        </div>
        <span className="status-pill">On schedule</span>
      </div>

      <div className="shipment-summary">
        <div><small>TRACKING NUMBER</small><strong>{shipment.trackingNumber}</strong></div>
        <div><small>SERVICE</small><strong>{shipment.service || 'Standard Delivery'}</strong></div>
        <div><small>ESTIMATED DELIVERY</small><strong>{shipment.estimatedDelivery || 'To be confirmed'}</strong></div>
      </div>

      {hasReceiverInfo && (
        <div
          style={{
            marginTop: 18,
            background: '#ffffff',
            border: '1px solid #d8e4e1',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 8px 24px rgba(9,46,42,0.06)',
          }}
        >
          <p className="eyebrow" style={{ marginBottom: 8 }}>Delivery details</p>
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Receiver information</h2>

          <div style={{ display: 'grid', gap: 13 }}>
            {shipment.receiverName && (
              <div>
                <small style={{ display: 'block', opacity: 0.65, fontWeight: 800 }}>RECEIVER NAME</small>
                <strong>{shipment.receiverName}</strong>
              </div>
            )}

            {shipment.receiverPhone && (
              <div>
                <small style={{ display: 'block', opacity: 0.65, fontWeight: 800 }}>RECEIVER PHONE</small>
                <a href={`tel:${shipment.receiverPhone}`} style={{ color: 'inherit', fontWeight: 700 }}>
                  {shipment.receiverPhone}
                </a>
              </div>
            )}

            {shipment.receiverAddress && (
              <div>
                <small style={{ display: 'block', opacity: 0.65, fontWeight: 800 }}>RECEIVER ADDRESS</small>
                <strong>{shipment.receiverAddress}</strong>
              </div>
            )}

            {shipment.weight && (
              <div>
                <small style={{ display: 'block', opacity: 0.65, fontWeight: 800 }}>PACKAGE WEIGHT</small>
                <strong>{shipment.weight}</strong>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid #e3ece9',
            }}
          >
            <small style={{ display: 'block', marginBottom: 4 }}>Need help with this shipment?</small>
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#0b4a42', fontWeight: 800 }}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      )}

      <div className="journey">
        <div className="journey-title">
          <div>
            <h2>Shipment journey</h2>
            <p>{shipment.origin} to {shipment.destination}</p>
          </div>
          <Box />
        </div>

        <div className="timeline">
          {events.map((event, i) => (
            <div className={`event ${i === 0 ? 'active' : ''}`} key={`${event.date}-${event.time}-${i}`}>
              <span className="event-dot">
                {i === 0 ? <Truck size={17} /> : <Check size={16} />}
              </span>
              <div className="event-body">
                <div>
                  <h3>{event.status}</h3>
                  <p><MapPin size={16} />{event.location}</p>
                  {event.note && <p className="event-note">{event.note}</p>}
                </div>
                <time>{event.date}<small>{event.time}</small></time>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Login({ navigate, onDemoLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isFirebaseConfigured) {
        onDemoLogin()
        return
      }
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('The email or password is incorrect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <Brand light />
        <button onClick={() => navigate('home')}><ArrowLeft /> Return to website</button>
      </div>
      <div className="login-panel">
        <div className="login-card">
          <span className="login-icon"><ShieldCheck /></span>
          <p className="eyebrow">Authorised staff only</p>
          <h1>Admin sign in</h1>
          <p>Manage shipments and customer tracking updates.</p>
          <form onSubmit={submit}>
            <label>
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@company.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </label>
            {error && <p className="form-error"><CircleAlert size={18} />{error}</p>}
            <button type="submit">
              {loading ? 'Signing in…' : 'Sign in securely'} <ArrowRight />
            </button>
          </form>
          {!isFirebaseConfigured && <p className="demo-login">Preview mode: enter any email and password.</p>}
        </div>
      </div>
    </div>
  )
}

function Dashboard({ navigate, demo, user }) {
  const [shipments, setShipments] = useState(demo ? [demoShipment] : [])
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [notice, setNotice] = useState('')
  const [editingShipment, setEditingShipment] = useState(null)

  useEffect(() => {
    if (!demo && db) {
      getDocs(query(collection(db, 'shipments'), orderBy('createdAt', 'desc'), limit(50)))
        .then(s => setShipments(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    }
  }, [demo])

  const counts = useMemo(() => ({
    total: shipments.length,
    moving: shipments.filter(s => ['In transit', 'Out for delivery'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
  }), [shipments])

  function generateNumber() {
    setForm(f => ({
      ...f,
      trackingNumber: `DEH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
    }))
  }

  function startCreate() {
    setEditingShipment(null)
    setForm({
      ...emptyForm,
      trackingNumber: `DEH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
    })
    setFormOpen(true)
  }

  function startEdit(shipment) {
    setEditingShipment(shipment)
    setForm({
      trackingNumber: shipment.trackingNumber || '',
      description: shipment.description || '',
      receiverName: shipment.receiverName || '',
      receiverPhone: shipment.receiverPhone || '',
      receiverAddress: shipment.receiverAddress || '',
      weight: shipment.weight || '',
      origin: shipment.origin || '',
      destination: shipment.destination || '',
      status: shipment.status || 'Shipment created',
      service: shipment.service || 'Standard Delivery',
      estimatedDelivery: shipment.estimatedDelivery || '',
      publicNote: '',
      currentLocation: shipment.events?.[0]?.location || shipment.origin || '',
    })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingShipment(null)
    setForm(emptyForm)
  }

  async function save(e) {
    e.preventDefault()

    const now = new Date()
    const trackingNumber = form.trackingNumber.trim().toUpperCase()

    const event = {
      status: form.status,
      location: (editingShipment ? form.currentLocation : form.origin).trim() || form.origin,
      note: form.publicNote || (editingShipment ? 'Shipment status updated.' : 'Shipment information received.'),
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }

    const record = {
      trackingNumber,
      description: form.description.trim(),
      receiverName: form.receiverName.trim(),
      receiverPhone: form.receiverPhone.trim(),
      receiverAddress: form.receiverAddress.trim(),
      weight: form.weight.trim(),
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      status: form.status,
      service: form.service.trim(),
      estimatedDelivery: form.estimatedDelivery.trim(),
      publicNote: form.publicNote.trim(),
      updatedAt: now.toLocaleString('en-GB'),
      events: editingShipment ? [event, ...(editingShipment.events || [])] : [event],
    }

    if (editingShipment) {
      if (demo) {
        setShipments(items => items.map(item =>
          (item.id || item.trackingNumber) === (editingShipment.id || editingShipment.trackingNumber)
            ? { ...editingShipment, ...record }
            : item
        ))
      } else {
        await updateDoc(doc(db, 'shipments', editingShipment.id), {
          ...record,
          updatedBy: user.uid,
          lastUpdatedAt: serverTimestamp(),
        })
        await setDoc(doc(db, 'public_tracking', trackingNumber), record)
        setShipments(items => items.map(item =>
          item.id === editingShipment.id ? { ...item, ...record } : item
        ))
      }
      setNotice('Shipment updated successfully.')
    } else {
      if (demo) {
        setShipments(items => [record, ...items])
      } else {
        const created = await addDoc(collection(db, 'shipments'), {
          ...record,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        })
        await setDoc(doc(db, 'public_tracking', trackingNumber), record)
        setShipments(items => [{ id: created.id, ...record }, ...items])
      }
      setNotice('Shipment created successfully.')
    }

    closeForm()
    setTimeout(() => setNotice(''), 3500)
  }

  async function logout() {
    if (!demo && auth) await signOut(auth)
    navigate('home')
  }

  return (
    <div className="dashboard">
      <aside>
        <Brand light />
        <nav>
          <button className="active"><LayoutDashboard /> Overview</button>
          <button onClick={startCreate}><Plus /> New shipment</button>
        </nav>
        <button className="logout" onClick={logout}><LogOut /> Sign out</button>
      </aside>

      <main className="dash-main">
        <header>
          <div><p>ADMIN DASHBOARD</p><h1>Shipment overview</h1></div>
          <button className="primary" onClick={startCreate}><Plus /> Create shipment</button>
        </header>

        {notice && <div className="success-notice"><Check />{notice}</div>}

        <section className="stat-grid">
          <article><span><Box /></span><div><small>ALL SHIPMENTS</small><strong>{counts.total}</strong></div></article>
          <article><span><Truck /></span><div><small>IN PROGRESS</small><strong>{counts.moving}</strong></div></article>
          <article><span><PackageCheck /></span><div><small>DELIVERED</small><strong>{counts.delivered}</strong></div></article>
        </section>

        <section className="shipment-table">
          <div className="table-title">
            <div><h2>Recent shipments</h2><p>View and manage customer deliveries.</p></div>
            <span>{shipments.length} records</span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Tracking number</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Delivery estimate</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, i) => (
                  <tr key={s.id || i}>
                    <td><strong>{s.trackingNumber}</strong><small>{s.description}</small></td>
                    <td>{s.origin}<small>to {s.destination}</small></td>
                    <td><span className="table-status">{s.status}</span></td>
                    <td>{s.estimatedDelivery || 'Not set'}</td>
                    <td><button className="table-action" onClick={() => startEdit(s)}>Update</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!shipments.length && (
            <div className="empty-state">
              <Box />
              <h3>No shipments yet</h3>
              <p>Create the first shipment to begin tracking.</p>
            </div>
          )}
        </section>
      </main>

      {formOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="shipment-form-title">
            <div className="modal-head">
              <div>
                <p className="eyebrow">Shipment record</p>
                <h2 id="shipment-form-title">{editingShipment ? 'Update shipment' : 'Create new shipment'}</h2>
              </div>
              <button onClick={closeForm} aria-label="Close"><X /></button>
            </div>

            <form onSubmit={save} className="shipment-form">
              <label>
                Tracking number
                <div className="inline-field">
                  <input
                    required
                    readOnly={!!editingShipment}
                    value={form.trackingNumber}
                    onChange={e => setForm({ ...form, trackingNumber: e.target.value })}
                    placeholder="DEH-2026-000001"
                  />
                  {!editingShipment && <button type="button" onClick={generateNumber}>Generate</button>}
                </div>
              </label>

              <label>
                Package description
                <input
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Documents"
                />
              </label>

              <div style={{ marginTop: 8, padding: 16, border: '1px solid #d8e4e1', borderRadius: 12 }}>
                <h3 style={{ marginTop: 0, marginBottom: 14 }}>Receiver information</h3>

                <label>
                  Receiver name
                  <input
                    required
                    value={form.receiverName}
                    onChange={e => setForm({ ...form, receiverName: e.target.value })}
                    placeholder="Full name"
                  />
                </label>

                <label>
                  Receiver phone number
                  <input
                    required
                    type="tel"
                    value={form.receiverPhone}
                    onChange={e => setForm({ ...form, receiverPhone: e.target.value })}
                    placeholder="e.g. +43 123 456 789"
                  />
                </label>

                <label>
                  Receiver address
                  <textarea
                    required
                    value={form.receiverAddress}
                    onChange={e => setForm({ ...form, receiverAddress: e.target.value })}
                    placeholder="Full delivery address"
                  />
                </label>

                <label>
                  Package weight
                  <input
                    required
                    value={form.weight}
                    onChange={e => setForm({ ...form, weight: e.target.value })}
                    placeholder="e.g. 4.5 kg"
                  />
                </label>
              </div>

              <div className="form-two">
                <label>
                  Origin
                  <input
                    required
                    value={form.origin}
                    onChange={e => setForm({ ...form, origin: e.target.value })}
                    placeholder="City, country"
                  />
                </label>
                <label>
                  Destination
                  <input
                    required
                    value={form.destination}
                    onChange={e => setForm({ ...form, destination: e.target.value })}
                    placeholder="City, country"
                  />
                </label>
              </div>

              <div className="form-two">
                <label>
                  Status
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>
                  Service
                  <input value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} />
                </label>
              </div>

              {editingShipment && (
                <label>
                  Current location
                  <input
                    required
                    value={form.currentLocation}
                    onChange={e => setForm({ ...form, currentLocation: e.target.value })}
                    placeholder="Current city or facility"
                  />
                </label>
              )}

              <label>
                Estimated delivery
                <input
                  value={form.estimatedDelivery}
                  onChange={e => setForm({ ...form, estimatedDelivery: e.target.value })}
                  placeholder="e.g. 26 September 2026"
                />
              </label>

              <label>
                Public update
                <textarea
                  value={form.publicNote}
                  onChange={e => setForm({ ...form, publicNote: e.target.value })}
                  placeholder="Information the customer can see"
                />
              </label>

              <div className="form-actions">
                <button type="button" onClick={closeForm}>Cancel</button>
                <button type="submit" className="primary">
                  {editingShipment ? 'Save update' : 'Create shipment'} <ArrowRight />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [shipment, setShipment] = useState(null)
  const [user, setUser] = useState(null)
  const [demoAdmin, setDemoAdmin] = useState(false)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, setUser)
  }, [])

  function navigate(next, data) {
    setPage(next)
    if (data) setShipment(data)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (page === 'home') return <Home navigate={navigate} />
  if (page === 'track') return <TrackingPage navigate={navigate} initialShipment={shipment} />
  if (page === 'admin' && !user && !demoAdmin) {
    return <Login navigate={navigate} onDemoLogin={() => setDemoAdmin(true)} />
  }
  if (page === 'admin' || user || demoAdmin) {
    return <Dashboard navigate={navigate} user={user} demo={demoAdmin || !isFirebaseConfigured} />
  }

  return null
}
