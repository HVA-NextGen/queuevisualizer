import { demo, formatSampleTime } from './data/demo'
import { getCongestion, getOccupancy } from './lib/congestion'
import { CongestionGauge } from './components/CongestionGauge'
import { HistoryChart } from './components/HistoryChart'
import './App.css'

function App() {
  const occupancy = getOccupancy(demo.total, demo.capacity)
  const status = getCongestion(occupancy)

  return (
    <>
      <a className="skip-link" href="#main">Siirry sisältöön</a>
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">k<span>+</span></span>
          <div>Kaitajärven<span className="brand-subtitle">keskussairaala</span></div>
        </div>
        <span className="organization">Kaitajärven hyvinvointialue</span>
      </header>

      <main id="main" tabIndex={-1}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">PÄIVYSTYKSEN TILANNEKUVA</p>
            <h1>Kuormitusmittari</h1>
            <p className="intro">Yksi näkymä päivystyksen kuormitukseen.</p>
          </div>
          <div className="sample-time">
            <span className="sample-dot" aria-hidden="true" />
            <div><strong>Kiinteä esimerkkitilanne</strong><time dateTime={demo.timestamp}>{formatSampleTime(demo.timestamp)}</time></div>
          </div>
        </div>

        <div className="overview">
          <section className={`panel congestion-panel status-${status.key}`} aria-labelledby="congestion-title">
            <div className="panel-heading">
              <h2 id="congestion-title">Päivystyksen kuormitus</h2>
              <span className="small-label">ESIMERKKI</span>
            </div>
            <CongestionGauge occupancy={occupancy} />
            <div className="status-message">
              <span className="status-pill"><span aria-hidden="true" />{status.label}</span>
              <p>Esimerkkikapasiteetista on käytössä {occupancy} %.</p>
            </div>
            <div className="gauge-legend" aria-label="Kuvitteelliset ruuhkatasot">
              <span><i className="legend-dot low" />Ei ruuhkaa</span>
              <span><i className="legend-dot moderate" />Kohtalainen</span>
              <span><i className="legend-dot high" />Ruuhkautunut</span>
            </div>
          </section>

          <div className="patient-panels">
            <section className="panel patient-card" aria-labelledby="patients-title">
              <div className="card-top"><span className="card-icon" aria-hidden="true">◎</span><span className="small-label">PÄIVYSTYKSESSÄ</span></div>
              <h2 id="patients-title">Potilaita yhteensä</h2>
              <p className="metric"><strong>{demo.total}</strong><span>potilasta</span></p>
              <div className="card-footer">Kuvitteellinen kapasiteetti <strong>{demo.capacity} potilasta</strong></div>
            </section>
            <section className="panel patient-card urgent-card" aria-labelledby="urgent-title">
              <div className="card-top"><span className="card-icon" aria-hidden="true">+</span><span className="small-label">OSA KOKONAISMÄÄRÄSTÄ</span></div>
              <h2 id="urgent-title">Erittäin kiireellisiä</h2>
              <p className="metric"><strong>{demo.urgent}</strong><span>potilasta</span></p>
              <div className="card-footer">Sisältyvät {demo.total} potilaan kokonaismäärään</div>
            </section>
          </div>
        </div>

        <section className="panel history-panel" aria-labelledby="history-title">
          <div className="panel-heading history-heading">
            <div><p className="eyebrow">KUVITTEELLINEN HISTORIA</p><h2 id="history-title">Kuormitus viimeisen 24 tunnin aikana</h2></div>
            <span className="chart-chip">24 tuntia · tuntikohtainen otos</span>
          </div>
          <HistoryChart history={demo.history} />
          <div className="history-footer"><span>Osuus kuvitteellisesta kapasiteetista (%)</span><span><i className="legend-dot history-dot" />Kiinteä esimerkkidata</span></div>
        </section>
      </main>
      <footer className="site-footer"><span>Kaitajärven keskussairaala <span aria-hidden="true">/</span> Kuormitusmittari</span><span>Kaitajärven hyvinvointialue</span></footer>
    </>
  )
}

export default App
