import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.main}>
      {/* <Link href={'/rtsessanta'} className="button">Calcolo RT60</Link> */}
      <Link href={'/grafico'} className="button">Grafico</Link>
    </div>
  )
}
