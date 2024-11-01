"use client";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Checker API</h1>
        <p>Status: <span style={{ color: 'green' }}>Online</span></p>
        <p>Your backend API is running smoothly.</p>
      </main>
      <footer className={styles.footer}>
        <p>
          Built by Gitcoin
        </p>
      </footer>
    </div>
  );
}
