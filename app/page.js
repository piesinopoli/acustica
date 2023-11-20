import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <>
      <div className='navbar'>
        <Link href={'/'} className='navbarLink active'>Tools Acustica</Link>
      </div>
      <div className={styles.main}>
        <Link href={'/rtsessanta'} className={styles.button}>Calcolo RT60</Link>
        <Link href={'/grafico'} className={styles.button}>Grafico</Link>
      </div>
    </>

  )
}
