// app/articles/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Article {
  article_id: number;
  title: string;
  content: string;
  image: string;
  created_at: string;
}

interface Comment {
  comment_id: number;
  article_id: number;
  user_id: number;
  parent_id: number | null;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user: string;
  replies: Comment[];
}

export default function ArticleDetail() {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article`);
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        if (data.code === '000') {
          const matchedArticle = data.articles.find((article: Article) => article.article_id === Number(id));
          if (matchedArticle) {
            setArticle(matchedArticle);
          } else {
            throw new Error('Article not found');
          }
        } else {
          throw new Error('Failed to fetch articles');
        }
      } catch (error) {
        setError((error as Error).message);
      }
    };

    if (id) {
      fetchArticles();
    }
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${id}`);
        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching comments: ${text}`);
          throw new Error(`Failed to fetch comments: ${response.status}`);
        }
        const data = await response.json();
        console.log('Comments fetched:', data);
        if (data.status === 'success') {
          setComments(data.data);
        } else if (data.status === 'error' && data.message === 'Comment not found') {
          setComments([]);
        } else {
          throw new Error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError((error as Error).message);
      }
    };

    if (id) {
      fetchComments();
    }
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100">
      <main className="container mx-auto my-10">
        <article className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-extrabold text-blue-900">{article.title}</h1>
          <div className="text-gray-500 text-sm mt-2">{new Date(article.created_at).toLocaleDateString()}</div>

          <div className="my-6">
            <Image src={`https://api.bettabeal.my.id${article.image}`} alt={article.title} width={800} height={400} className="w-full rounded-md object-cover" />
          </div>

          <div className="text-gray-700 space-y-4">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 text-gray-500 text-sm">Editor: Artis</div>
        </article>

        <section className="bg-white mt-10 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold text-blue-900">Comments</h2>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.comment_id} className="flex mt-4">
                <Image src="https://storage.googleapis.com/a1aa/image/RSLReZl2aH2UDiWUtgtIpWRUexUZkeBgzTnWEAjG5EkcothnA.jpg" alt="User Avatar" width={48} height={48} className="w-12 h-12 rounded-full" />
                <div className="ml-4">
                  <div className="text-sm font-semibold">User {comment.user_id}</div>
                  <div className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</div>
                  <p className="text-gray-700 mt-2">{comment.comment_text}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-bold text-blue-900">Add Comment</h2>
            <form className="mt-4">
              <textarea placeholder="Add Your Comment" required className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"></textarea>
              <button type="submit" className="mt-4 bg-blue-700 text-white py-2 px-6 rounded hover:bg-blue-800">
                Send Comment
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}