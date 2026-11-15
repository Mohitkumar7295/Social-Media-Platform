import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, Sparkles, UserPlus, BookOpen } from 'lucide-react';
import AppLayout from '../components/home/AppLayout';
import UserAvatar from '../components/common/UserAvatar';
import { insforge } from '../lib/insforge';
import { useAuth } from '../hooks/useAuth';

export default function Explore() {
  const { user } = useAuth();
  const [writers, setWriters] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [followNotice, setFollowNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadWriters() {
      setIsLoading(true);
      try {
        let query = insforge.database
          .from('profiles')
          .select('id, username, full_name, bio, avatar_url, created_at')
          .order('created_at', { ascending: false })
          .limit(30);

        const { data, error } = await query;

        if (isMounted) {
          if (!error && data) {
            setWriters(data);
          } else {
            setWriters([]);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setWriters([]);
          setIsLoading(false);
        }
      }
    }

    loadWriters();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredWriters = writers.filter((w) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      w.full_name?.toLowerCase().includes(q) ||
      w.username?.toLowerCase().includes(q) ||
      w.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout activeNav="explore">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-[#FF6719]" />
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
            Explore Writers
          </h1>
        </div>
        <p className="text-xs text-zinc-400">
          Discover authors, publications, and thinkers across WriteSpace.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter writers by name or bio..."
          className="w-full bg-[#141416] border border-[#242428] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FF6719] transition-all"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#141416] border border-[#242428] rounded-2xl p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-40" />
                <div className="h-3 bg-zinc-800/60 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredWriters.length > 0 ? (
        <div className="space-y-3">
          {filteredWriters.map((writer) => {
            const isSelf = writer.id === user?.id;

            return (
              <div
                key={writer.id}
                className="bg-[#141416] border border-[#242428] rounded-2xl p-4 flex items-center justify-between hover:border-[#32323a] transition-colors"
              >
                <Link
                  to={`/profile/${writer.username}`}
                  className="flex items-center gap-3.5 min-w-0 flex-1 mr-3 group"
                >
                  <UserAvatar
                    src={writer.avatar_url}
                    name={writer.full_name}
                    username={writer.username}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-white truncate">
                        {writer.full_name}
                      </h4>
                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/10 text-[#FF6719] border border-orange-500/20">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">@{writer.username}</p>
                    {writer.bio && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{writer.bio}</p>
                    )}
                  </div>
                </Link>

                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => setFollowNotice(true)}
                    className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#1f1f24] hover:bg-[#282830] text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-colors"
                  >
                    Follow
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#242428] rounded-2xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-white mb-1">No Writers Found</h3>
          <p className="text-xs text-zinc-400">Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Follow feature notice modal */}
      {followNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#18181c] border border-[#2e2e36] rounded-2xl p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-3">
              <UserPlus className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-serif font-bold text-white mb-1.5">
              Follow Actions Activate in Phase 7
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-5">
              The PostgreSQL `follows` schema and relation foundation are in place. The interactive follow / unfollow toggle workflows will be connected in Phase 7.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setFollowNotice(false)}
                className="px-4 py-2 rounded-xl bg-[#FF6719] hover:bg-[#e8590c] text-white font-medium text-xs transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
