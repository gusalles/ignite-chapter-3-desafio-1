import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import Header from '../../components/Header';
import { formattedDate } from '../../utils/date';
import Comments from '../../components/Comments';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  prevPost: Post;
  nextPost: Post;
  preview: boolean;
}

export default function Post({
  post,
  prevPost,
  nextPost,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) return <h1>Carregando...</h1>;

  const totalWords = post.data.content.reduce(
    (totalContent, currentContent) => {
      const headingWords = currentContent.heading?.split(' ').length || 0;

      const bodyWords = currentContent.body.reduce((totalBody, currentBody) => {
        const textWords = currentBody.text.split(' ').length;
        return totalBody + textWords;
      }, 0);

      return totalContent + headingWords + bodyWords;
    },
    0
  );

  const timeEstimmed = Math.ceil(totalWords / 200);

  const isPostEdited =
    post.first_publication_date !== post.last_publication_date;

  return (
    <div className={styles.postContainer}>
      <Header />
      <img src={post.data.banner.url} alt="banner" />
      <div className={styles.bodyContainer}>
        <h1>{post.data.title}</h1>
        <div className={styles.infoContainer}>
          <div>
            <span>
              <FiCalendar />
              {formattedDate(post.first_publication_date)}
            </span>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {timeEstimmed} min
            </span>
          </div>
          <div>
            {isPostEdited && (
              <span>
                {`* editado em ${formattedDate(
                  post.last_publication_date,
                  true
                )}`}
              </span>
            )}
          </div>
        </div>

        {post.data.content.map(content => (
          <section key={content.heading} className={styles.postContent}>
            <h2>{content.heading}</h2>
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </section>
        ))}
        <section className={styles.navigationContainer}>
          <div>
            {prevPost && (
              <>
                <h3>{prevPost.data.title}</h3>
                <Link href={`/post/${prevPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>
          <div>
            {nextPost && (
              <>
                <h3>{nextPost.data.title}</h3>
                <Link href={`/post/${nextPost.uid}`}>
                  <a style={{ textAlign: 'end' }}>Próximo post</a>
                </Link>
              </>
            )}
          </div>
        </section>
        <Comments />
        {preview && (
          <aside className={styles.previewContainer}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  return {
    props: {
      post,
      prevPost: prevPost?.results[0] ?? null,
      nextPost: nextPost?.results[0] ?? null,
      preview,
    },
  };
};
