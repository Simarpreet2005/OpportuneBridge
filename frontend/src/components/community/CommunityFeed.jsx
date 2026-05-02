import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { POST_API_END_POINT } from '@/utils/constant';
import Navbar from '../shared/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Heart, MessageCircle, Image as ImageIcon, Send, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';

const CommunityFeed = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);

    const fetchPosts = async () => {
        try {
            const res = await axios.get(POST_API_END_POINT, { withCredentials: true });
            if (res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePost = async () => {
        if (!content.trim() && !file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("content", content);
        if (file) formData.append("file", file);

        try {
            const res = await axios.post(POST_API_END_POINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success("Post created!");
                setContent("");
                setFile(null);
                setPosts([res.data.post, ...posts]);
            }
        } catch (error) {
            toast.error("Failed to post");
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleLike = async (postId) => {
        try {
            const res = await axios.post(`${POST_API_END_POINT}/${postId}/like`, {}, { withCredentials: true });

            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const isLiked = p.likes.includes(user?._id);
                    return {
                        ...p,
                        likes: isLiked ? p.likes.filter(id => id !== user?._id) : [...p.likes, user?._id]
                    };
                }
                return p;
            }));
        } catch (error) {
            console.log(error);
        }
    }

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const res = await axios.delete(`${POST_API_END_POINT}/${postId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success('Post deleted successfully');
                setPosts(posts.filter(p => p._id !== postId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete post');
            console.log(error);
        }
    }

    const PostItem = ({ post }) => {
        const [showComments, setShowComments] = useState(false);
        const [commentText, setCommentText] = useState("");

        const handleComment = async () => {
            if (!commentText.trim()) return;
            try {
                const res = await axios.post(`${POST_API_END_POINT}/${post._id}/comment`, { text: commentText }, { withCredentials: true });
                if (res.data.success) {
                    toast.success("Comment added");
                    setCommentText("");

                    fetchPosts();
                }
            } catch (error) {
                console.log(error);
            }
        }

        const isLiked = post.likes.includes(user?._id);

        return (
            <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
                <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                        <Avatar>
                            <AvatarImage src={post.author?.profile?.profilePhoto} />
                            <AvatarFallback>{post.author?.fullname?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className='font-bold'>{post.author?.fullname}</h4>
                            <span className='text-xs text-muted-foreground'>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {post.author?._id === user?._id && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className='w-4 h-4' />
                        </Button>
                    )}
                </div>
                <p className='text-foreground/90 whitespace-pre-wrap mb-4'>{post.content}</p>
                {post.image && (
                    <img src={post.image} alt="post" className='w-full h-auto rounded-lg mb-4 object-cover max-h-[500px]' />
                )}

                <div className='flex items-center gap-6 border-t pt-4'>
                    <Button variant="ghost" size="sm" onClick={() => handleLike(post._id)} className={isLiked ? 'text-red-500' : ''}>
                        <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                        {post.likes.length} Likes
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
                        <MessageCircle className='w-5 h-5 mr-2' />
                        {post.comments.length} Comments
                    </Button>
                </div>

                {showComments && (
                    <div className='mt-4 space-y-4'>
                        <div className='flex gap-2'>
                            <Textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="min-h-[40px] h-[40px] resize-none"
                            />
                            <Button size="icon" onClick={handleComment}><Send className='w-4 h-4' /></Button>
                        </div>
                        <div className='space-y-3 max-h-60 overflow-y-auto'>
                            {post.comments.map((comment, idx) => (
                                <div key={idx} className='flex gap-2 items-start'>
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={comment.user?.profile?.profilePhoto} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div className='bg-secondary/50 rounded-lg p-2 text-sm'>
                                        <span className='font-bold mr-2'>{comment.user?.fullname}</span>
                                        {comment.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className='min-h-screen'>
            <div className='max-w-3xl mx-auto px-4 py-8'>
                <h1 className='text-3xl font-bold mb-6'>Community Feed</h1>

                {/* Create Post */}
                <div className='bg-card border border-border rounded-xl p-4 mb-8 shadow-sm'>
                    <Textarea
                        placeholder="Share your interview experience, achievements, or questions..."
                        className="mb-4 resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                            <input
                                type="file"
                                id="image-upload"
                                className='hidden'
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0])}
                            />
                            <label htmlFor="image-upload">
                                <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                    <span><ImageIcon className='w-4 h-4 mr-2' /> {file ? file.name : "Add Image"}</span>
                                </Button>
                            </label>
                        </div>
                        <Button onClick={handlePost} disabled={loading}>{loading ? 'Posting...' : 'Post'}</Button>
                    </div>
                </div>

                {/* Posts List */}
                <div className='space-y-6'>
                    {posts.map((post) => (
                        <PostItem key={post._id} post={post} />
                    ))}
                    {posts.length === 0 && <p className='text-center text-muted-foreground'>No posts yet. Be the first!</p>}
                </div>
            </div>
        </div>
    );
};

export default CommunityFeed;
