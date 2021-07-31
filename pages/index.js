import Head from 'next/head'
import Search from '../components/search'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Github Search</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500&display=swap" rel="stylesheet"></link>
      </Head>

      <main className={styles.main}>
        <h2>🔎</h2>
        <Search />
      </main>
    </div>
  )
}
