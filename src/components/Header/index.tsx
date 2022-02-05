import { CSSProperties } from 'react';
import Link from 'next/link';

import styles from './header.module.scss';

interface HeaderProps {
  style?: CSSProperties;
}

export default function Header({ style }: HeaderProps): JSX.Element {
  return (
    <header className={styles.headerContainer} style={style}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
