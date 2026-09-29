import React, { useState } from 'react';
import { Vote, PlusCircle, CheckCircle2, Clock, Share2, BarChart2, Users } from 'lucide-react';
import { Poll } from '../types';
import { playBanterSound } from '../services/syncService';

interface InteractivePollsProps {
  polls: Poll[];
  onVote: (pollId: string, optionId: string) => void;
  onCreatePoll: (newPoll: Partial<Poll>) => void;
  onSharePoll: (poll: Poll) => void;
}

export const InteractivePolls: React.FC<InteractivePollsProps> = ({
  polls,
  onVote,
  onCreatePoll,
  onSharePoll,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Pub Ethics');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !option1.trim() || !option2.trim()) return;

    const options = [
      { id: 'opt-' + Date.now() + '-1', text: option1.trim(), votes: 0 },
      { id: 'opt-' + Date.now() + '-2', text: option2.trim(), votes: 0 },
    ];
    if (option3.trim()) {
      options.push({ id: 'opt-' + Date.now() + '-3', text: option3.trim(), votes: 0 });
    }
    if (option4.trim()) {
      options.push({ id: 'opt-' + Date.now() + '-4', text: option4.trim(), votes: 0 });
    }

    onCreatePoll({
      question: question.trim(),
      category,
      options,
      author: 'CommunityLad_' + Math.floor(Math.random() * 900 + 100),
      expiresIn: '3 days left',
    });

    playBanterSound('pint');
    setQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141620] via-[#171a26] to-[#10121a] border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-500 font-mono tracking-wider uppercase font-bold">
              <Vote className="w-4 h-4 text-amber-500" />
              <span>Real-Time Lad Debates · Community Consensus</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-wide text-white uppercase">
              INTERACTIVE BANTER POLLS
            </h2>
            <p className="text-sm text-slate-300">
              Settle the most heated pub arguments, stag trip rules, and hangover moral dilemmas. Cast your vote or start your own controversial ballot.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch A Banter Poll</span>
          </button>
        </div>
      </div>

      {/* Polls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

          return (
            <div
              key={poll.id}
              className="bg-[#11131b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    {poll.category}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{poll.expiresIn}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold font-heading text-white leading-snug mb-4">
                  {poll.question}
                </h3>

                {/* Poll Options */}
                <div className="space-y-2.5">
                  {poll.options.map((option) => {
                    const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    const isSelected = poll.userVotedOptionId === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          onVote(poll.id, option.id);
                          playBanterSound('pop');
                        }}
                        className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 shadow-sm'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {/* Background progress fill bar */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                            isSelected ? 'bg-amber-500/25' : 'bg-white/5'
                          }`}
                          style={{ width: `${percent}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                            )}
                            <span className="text-slate-200 font-medium leading-tight">
                              {option.text}
                            </span>
                          </div>
                          <span className="font-mono text-slate-400 font-bold shrink-0">
                            {percent}% ({option.votes})
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Poll footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{totalVotes} total lads voted</span>
                </div>

                <button
                  onClick={() => onSharePoll(poll)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Share Poll</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold font-heading text-white mb-1">
              Start A Community Banter Poll
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Pose a controversial moral question for the lads to vote on.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Poll Question</label>
                <input
                  type="text"
                  placeholder="e.g. Is it acceptable to skip Sunday League for your girlfriend's cousin's birthday?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Pub Ethics">Pub Ethics</option>
                  <option value="Stag Protocol">Stag Protocol</option>
                  <option value="Lads Code">Lads Code</option>
                  <option value="Sunday League">Sunday League</option>
                  <option value="Dating Dilemmas">Dating Dilemmas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Option 1 (Required)</label>
                <input
                  type="text"
                  placeholder="e.g. Immediate red card and lifetime ban"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Option 2 (Required)</label>
                <input
                  type="text"
                  placeholder="e.g. Acceptable ONLY if you buy a round after"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Option 3 (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Turn up in wedding attire at half time"
                  value={option3}
                  onChange={(e) => setOption3(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Publish Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
