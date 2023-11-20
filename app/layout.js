import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Header } from './components/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Acustica',
  description: 'Pietro Sinopoli',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div className='mainContainer'>
          {children}
        </div>
        <div className='footer'>
          <span>Fatto con il ♥ da Pietro Sinopoli</span>
          <Link href={'https://www.retrohub.it'}>www.retrohub.it</Link>
        </div>
      </body>
    </html>
  )
}
