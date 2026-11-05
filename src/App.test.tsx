// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'
import { demo, formatSampleTime } from './data/demo'

afterEach(cleanup)

it('shows the original Finnish hospital dashboard with fixed fictional data', () => {
  render(<App />)
  expect(screen.getByText('Kaitajärven')).toBeInTheDocument()
  expect(within(screen.getByRole('banner')).getByText('Kaitajärven hyvinvointialue')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Kuormitusmittari' })).toBeInTheDocument()
  expect(screen.getByText('Kohtalaista ruuhkaa')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /kuormitus 70 prosenttia/i })).toBeInTheDocument()
  expect(within(screen.getByRole('region', { name: 'Potilaita yhteensä' })).getByText('42')).toBeInTheDocument()
  expect(within(screen.getByRole('region', { name: 'Erittäin kiireellisiä' })).getByText('8')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Tämä on kuvitteellinen esittely' })).not.toBeInTheDocument()
  expect(screen.queryByText(/Kaitajärven keskussairaalaa ei ole olemassa/)).not.toBeInTheDocument()
  expect(screen.queryByText('Kuvitteellinen sairaala')).not.toBeInTheDocument()
  expect(screen.queryByText('Esittelyversio · Ei reaaliaikaista tietoa')).not.toBeInTheDocument()
})

it('shows 24 hourly bars with accessible values and no expandable table', () => {
  render(<App />)
  const chart = screen.getByRole('img', { name: /24 tunnin kuormitushistoria pylväskaaviona/ })
  const bars = chart.querySelectorAll('rect')
  expect(bars).toHaveLength(24)
  demo.history.forEach((point, index) => {
    expect(Number(bars[index].getAttribute('height'))).toBeCloseTo(point.occupancy / 100 * 160)
    const value = `${formatSampleTime(point.timestamp)}: ${point.occupancy} %`
    expect(bars[index].querySelector('title')).toHaveTextContent(value)
    expect(chart).toHaveAccessibleDescription(expect.stringContaining(value))
  })
  expect(screen.queryByText('Näytä kaavion tiedot taulukkona')).not.toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})
