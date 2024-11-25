// app/articles/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';

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

interface User {
  user_id: number;
  full_name: string;
  profile_image: string | null;
}

export default function ArticleDetail() {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const { id } = useParams();
  const router = useRouter();

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`);
        if (!response.ok) {
          const text = await response.text();
          console.error(`Error fetching comments: ${text}`);
          throw new Error(`Failed to fetch comments: ${response.status}`);
        }
        const data = await response.json();
        console.log('Comments fetched:', data);
        if (data.status === 'success') {
          const filteredComments = data.data.filter((comment: Comment) => comment.article_id === Number(id));
          setComments(filteredComments);
          fetchUsers(filteredComments.map((comment: Comment) => comment.user_id));
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

  const fetchUsers = async (userIds: number[]) => {
    const uniqueUserIds = Array.from(new Set(userIds));
    const userPromises = uniqueUserIds.map(async (userId) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user ${userId}`);
        }
        const data = await response.json();
        if (data.code === '000') {
          return { userId, user: data.customer };
        } else {
          throw new Error(`Failed to fetch user ${userId}`);
        }
      } catch (error) {
        console.error('Fetch user error:', error);
        return null;
      }
    });

    const usersData = await Promise.all(userPromises);
    const usersMap = usersData.reduce((acc, userData) => {
      if (userData) {
        acc[userData.userId] = {
          user_id: userData.user.user_id,
          full_name: userData.user.full_name,
          profile_image: userData.user.profile_image,
        };
      }
      return acc;
    }, {} as { [key: number]: User });

    setUsers(usersMap);
  };

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = Cookies.get('USR');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_text: commentText }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error adding comment: ${text}`);
        throw new Error(`Failed to add comment: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setComments(prevComments => [...prevComments, data.data]);
        setCommentText('');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError((error as Error).message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100">
      <main className="container mx-auto py-10">
        <article className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-extrabold text-blue-900">{article.title}</h1>
          <div className="text-gray-500 text-sm mt-2">{new Date(article.created_at).toLocaleDateString()}</div>

          <div className="my-6">
            <Image src={`https://api.bettabeal.my.id${article.image}`} alt={article.title} width={800} height={400} className="w-full h-[32rem] rounded-md object-cover" />
          </div>

          <div className="text-gray-700 space-y-4">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>

        <section className="bg-white mt-10 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold text-blue-900">Comments</h2>
          {comments.length > 0 ? (
            comments.map((comment) => {
              const user = users[comment.user_id];
              return (
                <div key={comment.comment_id} className="flex mt-4">
                  {user?.profile_image ? (
                    <Image src={`https://api.bettabeal.my.id${user.profile_image}`} alt="User Avatar" width={48} height={48} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                      {user?.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="text-sm font-semibold">{user?.full_name}</div>
                    <div className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</div>
                    <p className="text-gray-700 mt-2">{comment.comment_text}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No comments yet.</p>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-bold text-blue-900">Add Comment</h2>
            <form className="mt-4" onSubmit={handleCommentSubmit}>
              <textarea
                placeholder="Add Your Comment"
                required
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              ></textarea>
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