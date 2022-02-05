import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';
import { formattedDate } from '../utils/date';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  const formattedPosts = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: formattedDate(post.first_publication_date),
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattedPosts);

  async function handleLoadMorePosts(): Promise<void> {
    const newPostsPagination = await fetch(nextPage).then(response =>
      response.json()
    );

    setNextPage(newPostsPagination.next_page);

    const newFormattedPosts = newPostsPagination.results.map(post => {
      return {
        ...post,
        first_publication_date: formattedDate(post.first_publication_date),
      };
    });

    setPosts([...posts, ...newFormattedPosts]);
  }

  return (
    <>
      <Header style={{ margin: '42px auto' }} />
      <div className={styles.bodyContainer}>
        <div className={styles.bodyContent}>
          {posts &&
            posts.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h3>{post.data.title}</h3>

                  <p>{post.data.subtitle}</p>

                  <div className={styles.infoContainer}>
                    <span>
                      <FiCalendar />
                      {post.first_publication_date}
                    </span>

                    <span>
                      <FiUser />
                      {post.data.author}
                    </span>
                  </div>
                </a>
              </Link>
            ))}
        </div>
        <div>
          {nextPage && (
            <button
              type="button"
              className={styles.button}
              onClick={handleLoadMorePosts}
            >
              Carregar mais posts
            </button>
          )}
          {preview && (
            <aside className={styles.previewContainer}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
      preview,
    },
  };
};
